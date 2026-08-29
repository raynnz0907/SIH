import cv2
import numpy as np
import json

# MediaPipe 1.x changed the API — handle both versions gracefully
_pose_instance = None
_mp_pose_module = None

try:
    import mediapipe as mp
    _mp_pose_module = mp.solutions.pose
    _pose_instance = _mp_pose_module.Pose(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
    )
except Exception:
    # MediaPipe unavailable or incompatible — coaching still works via Ollama/fallback
    pass

try:
    from scipy.signal import savgol_filter
    _HAS_SCIPY = True
except ImportError:
    _HAS_SCIPY = False


class PoseAnalyzer:
    def __init__(self):
        self.mp_pose = _mp_pose_module
        self.pose    = _pose_instance
    
    def analyze_video(self, video_path: str) -> dict:
        # If MediaPipe failed to load, return neutral scores so coaching still works
        if self.pose is None:
            neutral = {k: 55.0 for k in ["knee_stability","hip_mobility","upper_body_posture",
                                          "movement_symmetry","explosive_capacity","flexibility","balance"]}
            return {"pose_data": [], "movement_scores": neutral, "movement_feedback": ["Pose detection unavailable — coaching based on role defaults."]}

        cap = cv2.VideoCapture(video_path)
        angles_over_time = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = self.pose.process(image)
            if results.pose_landmarks:
                angles = self.extract_joint_angles(results.pose_landmarks.landmark)
                angles_over_time.append(angles)

        cap.release()

        if not angles_over_time:
            return {"pose_data": [], "movement_scores": {}, "movement_feedback": ["Could not detect pose in video."]}
            
        scores = self.score_movement_quality(angles_over_time)
        feedback = self.generate_movement_feedback(scores)
        
        return {
            "pose_data": [], # Excluded to save space, but could contain angles_over_time
            "movement_scores": scores,
            "movement_feedback": feedback
        }
    
    def calculate_angle(self, a, b, c) -> float:
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        ba = a - b
        bc = c - b
        
        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)
        
        if norm_ba == 0 or norm_bc == 0:
            return 0.0
            
        cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        angle = np.arccos(cosine_angle)
        
        return np.degrees(angle)
    
    def extract_joint_angles(self, landmarks) -> dict:
        def get_pt(idx):
            return [landmarks[idx].x, landmarks[idx].y, landmarks[idx].z]
            
        return {
            "left_knee": self.calculate_angle(get_pt(23), get_pt(25), get_pt(27)),
            "right_knee": self.calculate_angle(get_pt(24), get_pt(26), get_pt(28)),
            "left_hip": self.calculate_angle(get_pt(11), get_pt(23), get_pt(25)),
            "right_hip": self.calculate_angle(get_pt(12), get_pt(24), get_pt(26)),
            "left_elbow": self.calculate_angle(get_pt(11), get_pt(13), get_pt(15)),
            "right_elbow": self.calculate_angle(get_pt(12), get_pt(14), get_pt(16)),
            "left_shoulder": self.calculate_angle(get_pt(13), get_pt(11), get_pt(23)),
            "right_shoulder": self.calculate_angle(get_pt(14), get_pt(12), get_pt(24)),
            "spine_angle": self.calculate_angle(get_pt(11), get_pt(23), get_pt(24)),
            "left_ankle": self.calculate_angle(get_pt(25), get_pt(27), [get_pt(27)[0], get_pt(27)[1]+0.1, get_pt(27)[2]]),
            "right_ankle": self.calculate_angle(get_pt(26), get_pt(28), [get_pt(28)[0], get_pt(28)[1]+0.1, get_pt(28)[2]])
        }
    
    def score_movement_quality(self, angles_over_time: list) -> dict:
        """
        Derive 7 movement quality scores (0-100) from the sequence of joint angles
        captured across all video frames.

        Scoring logic:
        - knee_stability   : low variance in knee angle = stable tracking (less wobble)
        - hip_mobility     : max range of hip flexion achieved
        - upper_body_posture: how close spine/shoulder angle stays to neutral (~180°)
        - movement_symmetry: left-right angle similarity index
        - explosive_capacity: max angular velocity (rate of change) across knee/hip
        - flexibility      : max hip + ankle range of motion composite
        - balance          : consistency of spine angle over time (low variance = good)
        """
        if not angles_over_time:
            return {k: 0.0 for k in [
                "knee_stability", "hip_mobility", "upper_body_posture",
                "movement_symmetry", "explosive_capacity", "flexibility", "balance"
            ]}

        def extract_series(key):
            return np.array([f.get(key, 0) for f in angles_over_time], dtype=float)

        lk = extract_series("left_knee")
        rk = extract_series("right_knee")
        lh = extract_series("left_hip")
        rh = extract_series("right_hip")
        sp = extract_series("spine_angle")
        la = extract_series("left_ankle")
        ra = extract_series("right_ankle")

        def norm(val, best, worst):
            """Normalise a raw metric to 0-100 (clipped)."""
            score = 100 * (val - worst) / (best - worst + 1e-9)
            return float(np.clip(score, 0, 100))

        # --- Knee Stability: low variance = high stability ---
        knee_var = (np.std(lk) + np.std(rk)) / 2
        knee_stability = norm(knee_var, 0, 30)           # 0 var → 100, 30+ var → 0
        knee_stability = 100 - knee_stability            # invert: low var = high score

        # --- Hip Mobility: large range of hip flexion = good ---
        hip_range = ((np.max(lh) - np.min(lh)) + (np.max(rh) - np.min(rh))) / 2
        hip_mobility = norm(hip_range, 90, 0)            # 90° range → 100

        # --- Upper Body Posture: spine close to 180° (erect) = good ---
        posture_dev = np.abs(sp - 180).mean()
        upper_body_posture = norm(posture_dev, 0, 45)    # 0° deviation → 100
        upper_body_posture = 100 - upper_body_posture

        # --- Movement Symmetry: left-right angle difference ---
        knee_asym = np.abs(lk - rk).mean()
        hip_asym  = np.abs(lh - rh).mean()
        asym_avg  = (knee_asym + hip_asym) / 2
        movement_symmetry = norm(asym_avg, 0, 20)        # 0° diff → 100
        movement_symmetry = 100 - movement_symmetry

        # --- Explosive Capacity: max angular velocity (°/frame) ---
        if len(lk) > 1:
            knee_vel = np.abs(np.diff(lk)) + np.abs(np.diff(rk))
            max_vel  = np.percentile(knee_vel, 90)       # 90th percentile peak
        else:
            max_vel = 0
        explosive_capacity = norm(max_vel, 15, 0)        # ≥15 °/frame → 100

        # --- Flexibility: combined hip + ankle range of motion ---
        ankle_range  = ((np.max(la) - np.min(la)) + (np.max(ra) - np.min(ra))) / 2
        flex_composite = (hip_range * 0.6 + ankle_range * 0.4)
        flexibility = norm(flex_composite, 80, 0)

        # --- Balance: spine angle consistency over time ---
        spine_var = np.std(sp)
        balance = norm(spine_var, 0, 20)
        balance = 100 - balance

        return {
            "knee_stability":     round(knee_stability, 1),
            "hip_mobility":       round(hip_mobility, 1),
            "upper_body_posture": round(upper_body_posture, 1),
            "movement_symmetry":  round(movement_symmetry, 1),
            "explosive_capacity": round(explosive_capacity, 1),
            "flexibility":        round(flexibility, 1),
            "balance":            round(balance, 1),
        }

    def generate_movement_feedback(self, scores: dict) -> list:
        """Generate human-readable coaching feedback for each movement metric."""
        thresholds = {
            "knee_stability":     {
                "low":  "Your knees show significant wobble during movement — focus on VMO strengthening and single-leg stability drills.",
                "mid":  "Knee tracking is decent but inconsistent — add lateral band walks and split squat progressions.",
                "high": "Excellent knee stability — your tracking is controlled throughout the movement."
            },
            "hip_mobility":       {
                "low":  "Limited hip range of motion detected — prioritise hip flexor stretching and 90/90 mobility work.",
                "mid":  "Moderate hip mobility — add deep squat holds and pigeon pose to unlock more range.",
                "high": "Great hip mobility — your deep range positions are well achieved."
            },
            "upper_body_posture": {
                "low":  "Significant forward lean or trunk deviation — strengthen core anti-flexion and improve thoracic extension.",
                "mid":  "Some postural breakdown under load — focus on bracing cues and face pulls.",
                "high": "Strong upright posture maintained throughout — excellent trunk control."
            },
            "movement_symmetry":  {
                "low":  "Marked left-right imbalance detected — address with single-leg exercises on your weaker side.",
                "mid":  "Minor asymmetry present — include unilateral drills to even out side-to-side differences.",
                "high": "Very symmetrical movement patterns — both sides are working in sync."
            },
            "explosive_capacity": {
                "low":  "Low peak angular velocity — add plyometrics (box jumps, power cleans) to develop rate of force development.",
                "mid":  "Moderate explosiveness — incorporate jump squats and sprint acceleration work.",
                "high": "High explosive output detected — excellent power production capacity."
            },
            "flexibility":        {
                "low":  "Restricted range of motion affecting technique — daily dynamic stretching and yoga-based mobility work recommended.",
                "mid":  "Moderate flexibility — progressive stretching and PNF techniques will help.",
                "high": "Excellent joint range across hip and ankle — great foundation for athletic movement."
            },
            "balance":            {
                "low":  "Poor single-leg balance and centre of mass control — add single-leg RDLs, Bosu work, and proprioception drills.",
                "mid":  "Moderate balance — challenge with eyes-closed or unstable surface progressions.",
                "high": "Solid balance and postural control — ready for advanced reactive drills."
            },
        }
        feedback = []
        for metric, score in scores.items():
            cues = thresholds.get(metric, {"low": "Needs work.", "mid": "Decent.", "high": "Good."})
            label = metric.replace("_", " ").title()
            if score < 50:
                feedback.append(f"⚠️ {label} ({score:.0f}/100): {cues['low']}")
            elif score < 75:
                feedback.append(f"📈 {label} ({score:.0f}/100): {cues['mid']}")
            else:
                feedback.append(f"✅ {label} ({score:.0f}/100): {cues['high']}")
        return feedback

    # ── AI Coaching ────────────────────────────────────────────────────────

    def generate_coaching_advice(self, sport: str, role: str, movement_scores: dict) -> dict:
        """Call Ollama Mistral for sport-specific coaching. Falls back gracefully."""
        import ollama, json, re

        scores_text = "\n".join(
            f"  - {k.replace('_',' ').title()}: {v:.0f}/100" for k, v in movement_scores.items()
        ) or "  - General movement analysis complete"

        sport_context = {
            "football":   "kicking technique, shooting mechanics, off-ball runs, pressing, and positional play",
            "cricket":    "batting stance, bowling action, footwork, fielding agility, and game strategy",
            "basketball": "shooting form, dribbling, defensive footwork, spacing, and court vision",
            "athletics":  "sprint mechanics, starting technique, arm drive, stride efficiency, and race strategy",
        }.get(sport, "sport-specific technique, movement efficiency, and tactics")

        prompt = f"""You are an elite {sport} coach analysing an athlete's training video.
Sport: {sport.title()} | Role: {role.replace('_',' ').title()}
Focus on: {sport_context}

Video movement scores:
{scores_text}

Give direct, specific, practical coaching. Return ONLY valid JSON, no markdown:
{{
  "overall_assessment": "2-3 sentence honest assessment",
  "strengths": ["specific strength 1", "specific strength 2"],
  "technique_tips": [
    {{"title": "tip", "detail": "specific actionable advice for {sport}", "priority": "high"}},
    {{"title": "tip", "detail": "specific actionable advice", "priority": "medium"}},
    {{"title": "tip", "detail": "specific actionable advice", "priority": "low"}}
  ],
  "strategy_tips": [
    {{"title": "title", "detail": "tactical advice for {role.replace('_',' ')} in {sport}"}},
    {{"title": "title", "detail": "more strategic advice"}}
  ],
  "drills": [
    {{"name": "name", "description": "exact drill instructions", "reps": "e.g. 3x10"}},
    {{"name": "name", "description": "instructions", "reps": "sets/time"}},
    {{"name": "name", "description": "instructions", "reps": "sets/time"}}
  ]
}}"""

        try:
            client = ollama.Client(host="http://localhost:11434")
            resp = client.chat(
                model="mistral",
                messages=[
                    {"role": "system", "content": "You are a world-class sports coach. Respond ONLY with valid JSON."},
                    {"role": "user",   "content": prompt},
                ],
                options={"temperature": 0.3, "num_predict": 2048},
            )
            raw = resp["message"]["content"].strip()
            raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip()
            raw = re.sub(r"```$",          "", raw, flags=re.MULTILINE).strip()
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            if m:
                result = json.loads(m.group())
                result["_source"] = "mistral"
                return result
        except Exception:
            pass

        return self.get_fallback_coaching(sport, role)

    def get_fallback_coaching(self, sport: str, role: str) -> dict:
        """Detailed hardcoded coaching for every sport when Ollama is unavailable."""
        lib = {
            "football": {
                "striker": {
                    "overall_assessment": "Movement shows good forward momentum. Sharpen your shooting mechanics and off-ball timing to maximise goal threat.",
                    "strengths": ["Positive forward movement", "Good approach speed"],
                    "technique_tips": [
                        {"title": "Shooting Technique", "detail": "Plant standing foot 15-20 cm beside the ball. Lock ankle firm, strike through the centre with your laces, follow through toward goal. Keep head down and over the ball.", "priority": "high"},
                        {"title": "First Touch", "detail": "Open body at 45° before receiving. Cushion with a relaxed foot and redirect into space in one motion — not two separate touches.", "priority": "high"},
                        {"title": "Aerial Challenge", "detail": "Attack the ball at the peak of your jump. Arch your back before contact, then drive your neck muscles forward to generate power. Aim for the corners.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Penalty-Box Runs", "detail": "Hold your run until the last moment to stay onside. Pin on the last defender's shoulder and cut diagonally to the near post as the ball is played."},
                        {"title": "Press Trigger", "detail": "Press when the ball goes to a defender's weaker foot or a back-pass to the keeper. Sprint to cut the short pass — not directly at the ball."},
                    ],
                    "drills": [
                        {"name": "Wall-Rebound Shooting", "description": "8m from wall, pass firmly, control rebound, shoot at goal 12m away — all in one smooth motion.", "reps": "4×8 each foot"},
                        {"name": "Diagonal Run Finishing", "description": "Start centre circle, sprint diagonally into box to meet a cross from wide. Finish first-time.", "reps": "3×6 each side"},
                        {"name": "1v1 vs Goalkeeper", "description": "Begin 18m out, drive at pace and beat keeper with placement to near or far post.", "reps": "5×10"},
                    ],
                },
                "_default": {
                    "overall_assessment": "Good athletic movement base. Role-specific technical work and positional discipline will bring significant improvement.",
                    "strengths": ["Consistent movement rhythm", "Good spatial awareness"],
                    "technique_tips": [
                        {"title": "Passing Accuracy", "detail": "Strike through the middle of the ball with your instep. Locked ankle, knee over ball, follow through toward target.", "priority": "high"},
                        {"title": "Change of Direction", "detail": "Plant outside foot firmly and drop hips low before exploding the new direction. Stay low — don't stand tall during the cut.", "priority": "medium"},
                        {"title": "Defensive Shape", "detail": "Face the ball at a slight angle, never square. Show the attacker onto their weaker foot by blocking the stronger-foot path.", "priority": "low"},
                    ],
                    "strategy_tips": [
                        {"title": "Pre-Scan Before Receiving", "detail": "Look over both shoulders before the ball arrives. Know where defenders, space, and teammates are before you touch the ball."},
                        {"title": "Compact Shape Out of Possession", "detail": "When your team loses the ball, reduce space between lines immediately. Stay within 5m of the nearest teammate."},
                    ],
                    "drills": [
                        {"name": "Rondo (4v1)", "description": "Passing circle with a defender in the middle, maximum 2 touches. Sharpens quick decision-making and passing accuracy.", "reps": "3×5 min"},
                        {"name": "T-Cone Agility", "description": "Set 4 cones in a T. Sprint, side-shuffle, back-pedal in sequence. Keep hips low throughout.", "reps": "6×rep"},
                    ],
                },
            },
            "cricket": {
                "batsman": {
                    "overall_assessment": "Batting analysis shows a stable base. Key improvement areas are footwork to the pitch of the ball and executing shots more decisively under pressure.",
                    "strengths": ["Stable crease position", "Good weight transfer on front foot"],
                    "technique_tips": [
                        {"title": "Front Foot Drive", "detail": "Lead with front elbow toward mid-off. Step to the pitch of the ball, transfer weight fully forward, drive bat face through the ball and extend toward the target. Hold your follow-through position.", "priority": "high"},
                        {"title": "Back Foot Defence", "detail": "Rock onto back foot early for short balls. Keep head level with ball trajectory, bring bat straight down with SOFT hands to absorb pace. Don't reach — let the ball come to you.", "priority": "high"},
                        {"title": "Grip and Backlift", "detail": "Form a 'V' with thumb and forefinger of both hands down the back of the handle. Lift toward off-stump slightly angled — this naturally closes the bat face for straighter driving.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "The Off-Stump Leave", "detail": "Mark your off-stump mentally. Any delivery outside this line not threatening stumps — leave it confidently with hard hands. A good leave is as valuable as a boundary."},
                        {"title": "Play Percentages Early", "detail": "First 20 balls: play every ball on merit, no pre-meditated shots. Only play shots you can reach to the pitch of the ball. Build innings before risk-taking."},
                    ],
                    "drills": [
                        {"name": "Throw-Down Drives", "description": "Feeder throws full-length deliveries on off-stump line from 8m. Drive with full follow-through and freeze final position for 2 seconds checking balance.", "reps": "4×20 balls"},
                        {"name": "Shadow Batting — Footwork Only", "description": "No ball. Call 'full' or 'short' randomly and move feet only. 10 front foot, 10 back foot. Builds automatic footwork responses.", "reps": "5 min daily"},
                        {"name": "Soft Hands Defence", "description": "Slow throw-downs at good length. Play dead-bat defence — ball must drop immediately at feet. Zero follow-through. Loosens grip at contact.", "reps": "3×15 balls"},
                    ],
                },
                "bowler": {
                    "overall_assessment": "Bowling action shows a decent run-up but release point and follow-through need work for consistency. Build a repeatable, high-action delivery.",
                    "strengths": ["Consistent approach run", "Good rotation in delivery stride"],
                    "technique_tips": [
                        {"title": "High Front Arm", "detail": "Non-bowling arm must point at the target at jump. Drive it down hard and fast through delivery — this pulls your bowling arm over and generates pace and accuracy.", "priority": "high"},
                        {"title": "Braced Front Leg", "detail": "Front leg must be straight and locked at delivery. A bent front knee loses all energy downward instead of upward into the ball. Plant and brace.", "priority": "high"},
                        {"title": "Wrist Position at Release", "detail": "For pace/outswing: wrist behind ball, seam upright, fingers on top. For inswing: angle seam toward fine leg. Consistent wrist position = consistent movement.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Hit the Corridor", "detail": "Target 8-9m from stumps on off-stump line on every delivery. This forces a decision on every ball. Never give away width or half-volleys."},
                        {"title": "Set the Batsman Up", "detail": "Bowl 3 outswingers, then nip one back off the seam to the same line. Batsman commits to the away movement and gets beaten inside edge."},
                    ],
                    "drills": [
                        {"name": "Target Landing", "description": "Place a coin/tape on good-length spot on off-stump line. Bowl full run-up aiming to land on the target. Track accuracy out of 30 balls.", "reps": "30 balls/session"},
                        {"name": "Slow-Motion Action", "description": "Bowl at 40% pace. Focus only on front arm drive and braced front leg. Hold delivery position 3 seconds after each ball.", "reps": "4×8 balls"},
                        {"name": "Wall High-Action Drill", "description": "Stand sideways to wall with bowling arm closest. Go through full delivery — front arm must NOT hit wall. Ensures high action.", "reps": "3×10 reps"},
                    ],
                },
                "all-rounder": {
                    "overall_assessment": "Athletic versatility detected. As an all-rounder, keep both disciplines sharp — consistent batting and bowling technique is your biggest weapon.",
                    "strengths": ["Good all-round athleticism", "Versatile movement patterns"],
                    "technique_tips": [
                        {"title": "Batting: Middle-Stump Guard", "detail": "Take middle-stump guard to cover both sides equally. Handles both inswing and outswing and lets you drive on both sides.", "priority": "high"},
                        {"title": "Bowling: Repeatable Action", "detail": "Video your bowling action from side-on. Release point must be identical on every ball — variations here cause full-tosses, no-balls, and wide lines.", "priority": "high"},
                        {"title": "Between-Innings Activation", "detail": "After fielding, do a 5-min dynamic warm-up before batting: leg swings, hip circles, shadow drives. Different muscle demands need preparation.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Know Your Innings Role", "detail": "Batting at 5 or 7? Aggressive or anchor? Bowling first or second change? Know what the team needs from you in each situation before you go out."},
                        {"title": "Bowl to Learn", "detail": "When bowling, study the batsmen's weaknesses. Apply those insights when you bat — you know exactly what troubles people because you try to exploit it yourself."},
                    ],
                    "drills": [
                        {"name": "All-Rounder Fitness Circuit", "description": "Bowl 5 balls, sprint boundary and back, take 5 catches, shadow-bat 1 min. Simulates real match demands.", "reps": "3 full circuits"},
                        {"name": "Off-Stump Drives", "description": "Throw-downs on off-stump full length, drive straight and through covers, alternate each ball.", "reps": "4×15 balls"},
                    ],
                },
                "wicket-keeper": {
                    "overall_assessment": "Keeping posture shows a decent base. Focus on softer hands, decisive footwork, and standing up to spinners to become a complete keeper.",
                    "strengths": ["Athletic ready position", "Good reflexes"],
                    "technique_tips": [
                        {"title": "Keeping Stance", "detail": "Crouch with hips below shoulders — don't bend at waist. Weight on balls of feet. Hands together, fingers pointing DOWN. Eyes level with the bails.", "priority": "high"},
                        {"title": "Soft Hands", "detail": "Catch in front of your face, not beside your body. Let hands travel back 5-10 cm after contact to absorb pace. Hard hands = dropped catches.", "priority": "high"},
                        {"title": "Leg-Side Movement", "detail": "Slide step: right foot moves first, left follows. NEVER cross feet. Stay low. Final catch position must be balanced, not leaning.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Communication", "detail": "Constantly talk to slips and gully. Call 'Yours!' early and clearly. Give direction on run-outs — you see the whole field."},
                        {"title": "Standing Up to Spinners", "detail": "Start closer than feels comfortable. If consistently taking balls in front of body, you're too far back. Standing closer creates stumping opportunities and pressures the batsman."},
                    ],
                    "drills": [
                        {"name": "Reaction Wall Catches", "description": "Stand 2m from wall facing away from partner. Partner throws at wall unexpectedly — catch the rebound. Builds reactive catching.", "reps": "4×2 min"},
                        {"name": "Standing-Up Drill", "description": "Stand up to a slow-medium bowler on a mat. Take catches laterally at knee height on both sides.", "reps": "30 balls each side"},
                    ],
                },
                "_default": {
                    "overall_assessment": "Good athletic foundation for cricket. Focus on the technical demands of your specific position for maximum improvement.",
                    "strengths": ["Good general athleticism", "Solid body control"],
                    "technique_tips": [
                        {"title": "Ready Position", "detail": "As the bowler enters delivery stride, take a small bounce onto balls of feet. Pre-loads muscles so you can move in any direction instantly.", "priority": "high"},
                        {"title": "Throwing Mechanics", "detail": "Align non-throwing shoulder toward target before releasing. Step into the throw with opposite foot. Strong sideways position = faster, more accurate throw.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Read the Bowler", "detail": "Watch wrist and hand position to anticipate seam or spin movement. Adjust your approach based on what you read in the first few deliveries."},
                    ],
                    "drills": [
                        {"name": "Catching and Throwing Circuit", "description": "High catches, reflex catches, and 30m power throws at a target stump. Rotate through all three.", "reps": "10 min daily"},
                    ],
                },
            },
            "basketball": {
                "_default": {
                    "overall_assessment": "Active footwork and good court awareness. Sharpen shooting mechanics and defensive positioning to be significantly more impactful on both ends.",
                    "strengths": ["Active feet and lateral movement", "Strong basket approach"],
                    "technique_tips": [
                        {"title": "Shooting Form (BEEF)", "detail": "Balance: feet shoulder-width, shooting foot slightly forward. Eyes: back of rim throughout. Elbow: 90° directly under ball. Follow-through: snap wrist fully, hold until ball hits rim.", "priority": "high"},
                        {"title": "Triple Threat", "detail": "Catch every ball in athletic stance — knees bent, ball protected at shooting hip. Be equally dangerous as driver, passer, or shooter.", "priority": "high"},
                        {"title": "Defensive Slide", "detail": "Low squat, wide base. Slide feet — never cross. One hand up to contest, one out to deny passes. Hips lower than the ball-handler's at all times.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Court Spacing", "detail": "Stay 4-5m from teammates off-ball. Crowding destroys driving lanes and passing angles. Spread the floor to make defence work."},
                        {"title": "Box Out Every Shot", "detail": "Before pursuing the rebound, make physical contact with your defender first. Turn and seal them. 80% of rebounds go to whoever establishes position, not who jumps highest."},
                    ],
                    "drills": [
                        {"name": "Mikan Drill", "description": "Alternate close-range layups from each side of basket without letting ball hit ground. Develops touch and timing.", "reps": "5×1 min"},
                        {"name": "Form Shooting", "description": "1m from basket, one hand only with perfect BEEF form. No jumping until form is automatic.", "reps": "3×25 makes"},
                        {"name": "Defensive Slide Course", "description": "Zig-zag cones in defensive stance without crossing feet, touching each cone.", "reps": "4×2 min"},
                    ],
                },
            },
            "athletics": {
                "_default": {
                    "overall_assessment": "Sprint mechanics show good forward lean and arm engagement. Focus on drive phase and maintaining form in the final 20m where most athletes lose time.",
                    "strengths": ["Good forward body angle", "Active arm drive"],
                    "technique_tips": [
                        {"title": "Drive Phase (0-30m)", "detail": "Stay at 45° body angle for first 8-10 strides. Drive knees forward and up, not backward. Push the ground back powerfully. Rise to full height gradually — not immediately.", "priority": "high"},
                        {"title": "Arm Mechanics", "detail": "Arms drive straight forward-back, never across the body. Elbow stays at 90°. Hands relaxed. Fast arms = fast legs — they are directly linked.", "priority": "high"},
                        {"title": "Foot Strike", "detail": "Strike ground under centre of mass, not in front. Landing in front acts as a brake. Think 'pull the ground back'. Ball-of-foot contact, never heel-first.", "priority": "medium"},
                    ],
                    "strategy_tips": [
                        {"title": "Race Phases", "detail": "0-30m: maximum acceleration with forward lean. 30-60m: transition to full speed. 60-80m: maintain max velocity, stay tall. 80-100m: RELAX — loosen jaw, shoulders, hands. Tension kills your finish."},
                        {"title": "Relaxation at Speed", "detail": "Tension kills speed. In the final 30m, consciously relax your face, hands, and shoulders. Sprinting fast is about removing brakes — not applying more power."},
                    ],
                    "drills": [
                        {"name": "A-March", "description": "Walk forward with exaggerated knee drive to hip height. Foot dorsiflexed (toes up), land on ball of foot. Arms mirror legs.", "reps": "4×20m"},
                        {"name": "Wall Drive Drill", "description": "Hands flat on wall at 45° lean. Alternate single-leg knee drives at tempo. Core tight, hips level, foot dorsiflexed.", "reps": "4×10 each leg"},
                        {"name": "Wicket Runs", "description": "Place flat markers every 1.2m in a line. Run through maintaining consistent stride. Prevents over-striding.", "reps": "6×30m"},
                    ],
                },
            },
        }
        sport_data = lib.get(sport, lib["football"])
        tips = sport_data.get(role, sport_data.get("_default", lib["football"]["_default"]))
        tips["_source"] = "built-in"
        return tips
