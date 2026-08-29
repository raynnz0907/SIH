import ollama
import json
import re

# ─── Configuration ────────────────────────────────────────────────────────────
OLLAMA_MODEL = "mistral"          # Primary model (4.4 GB, great JSON output)
OLLAMA_FALLBACK_MODEL = "llama3.2"  # Fallback if mistral is busy
OLLAMA_HOST = "http://localhost:11434"


class PlanGenerator:
    """
    Generates structured 4-week training and recovery plans using a local
    Ollama LLM (Mistral by default), with a comprehensive built-in fallback.
    """

    def __init__(self):
        self.client = ollama.Client(host=OLLAMA_HOST)
        self._model = OLLAMA_MODEL

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_plan(self, athlete_profile: dict, bottlenecks: list) -> dict:
        """Generate a 4-week structured training plan via Ollama."""
        prompt = self.build_prompt(athlete_profile, bottlenecks)

        for model in [self._model, OLLAMA_FALLBACK_MODEL]:
            try:
                response = self.client.chat(
                    model=model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an elite sports performance coach. "
                                "You ONLY respond with valid JSON — no markdown, no explanation, no code fences. "
                                "Your JSON must exactly match the schema requested."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    options={"temperature": 0.3, "num_predict": 4096},
                )
                raw = response["message"]["content"].strip()
                # Strip any accidental markdown fences
                raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip()
                raw = re.sub(r"```$", "", raw, flags=re.MULTILINE).strip()
                # Find the outermost JSON object
                match = re.search(r"\{.*\}", raw, re.DOTALL)
                if match:
                    plan = json.loads(match.group())
                    plan["_source"] = f"ollama:{model}"
                    return plan
            except Exception:
                continue  # Try fallback model or built-in template

        return self._fallback_plan(athlete_profile, bottlenecks)

    def generate_recovery_plan(self, athlete_profile: dict, bottlenecks: list) -> dict:
        """Generate a complementary recovery protocol."""
        sport = athlete_profile.get("sport", "sport")
        role = athlete_profile.get("role", "athlete")
        top_bottleneck = (
            bottlenecks[0]["attribute"].replace("_", " ")
            if bottlenecks
            else "general conditioning"
        )
        return {
            "daily_habits": [
                "Sleep 8–9 hours per night — consistent sleep/wake times are critical",
                "Hydrate: 35 ml per kg bodyweight + 500 ml extra per hour of training",
                "Post-session nutrition: 20–40 g protein + 1 g/kg carbohydrate within 30 minutes",
            ],
            "active_recovery_sessions": [
                {
                    "name": "Foam Rolling Circuit",
                    "duration_minutes": 15,
                    "exercises": ["Quad roll", "IT band roll", "Thoracic spine roll", "Calf roll", "Glute roll"],
                    "when": "Every evening before bed",
                },
                {
                    "name": "Mobility Flow",
                    "duration_minutes": 20,
                    "exercises": ["90/90 hip stretch (2 min each side)", "World's greatest stretch", "Cat-cow", "Deep squat hold", "Pigeon pose"],
                    "when": "On rest days or as morning routine",
                },
            ],
            "weekly_recovery_schedule": {
                "day_1": "Light 10-min walk + full foam rolling circuit",
                "day_2": "Active recovery: 20-min low-intensity swim or cycle",
                "day_3": "Mobility flow + breathing exercises",
                "day_4": "Full rest or gentle yoga",
            },
            "injury_prevention_focus": (
                f"Given your {top_bottleneck} deficit, prioritise targeted prehab "
                f"for that movement pattern every session."
            ),
            "load_management_tip": (
                f"As a {role} in {sport}, if perceived exertion averages above 7/10 "
                f"for 3+ consecutive days, insert an extra rest day."
            ),
        }

    # ------------------------------------------------------------------
    # Prompt building
    # ------------------------------------------------------------------

    def build_prompt(self, athlete_profile: dict, bottlenecks: list) -> str:
        sport = athlete_profile.get("sport", "sport")
        role = athlete_profile.get("role", "athlete")
        training_days = athlete_profile.get("training_days_per_week", 4)
        session_mins = athlete_profile.get("session_duration_minutes", 60)
        experience = athlete_profile.get("experience_level", "intermediate")
        goals = athlete_profile.get("goals", [])
        age = athlete_profile.get("age", "unknown")

        bottleneck_text = "\n".join([
            f"  {i+1}. {b['attribute'].replace('_', ' ').title()} — "
            f"Score: {b['score']:.0f}/100, Benchmark: {b['benchmark']}/100, "
            f"Gap: {b['gap']:.0f} pts. {b.get('role_relevance_explanation', '')}"
            for i, b in enumerate(bottlenecks[:5])
        ])
        goals_text = ", ".join(goals) if goals else "general athletic improvement"

        return f"""Generate a 4-week training plan as JSON for this athlete:

Sport: {sport} | Role: {role} | Experience: {experience} | Age: {age}
Training days/week: {training_days} | Session duration: {session_mins} minutes
Goals: {goals_text}

Top development bottlenecks:
{bottleneck_text}

Rules:
- {training_days} training sessions per week, rest on remaining days
- Sessions progress in intensity each week (Week 1 foundation → Week 4 peak)
- 60%+ of exercises must target the top 2-3 bottlenecks
- Include role-specific {sport} {role} exercises
- Each exercise needs: name, sets, reps, intensity_level (Low/Medium/High/Max), rest_seconds, coaching_cue, targets_bottleneck

Return ONLY this JSON structure (no markdown, no text outside JSON):
{{
  "plan_title": "string",
  "plan_summary": "2-3 sentence summary",
  "weeks": [
    {{
      "week_number": 1,
      "week_theme": "string",
      "sessions": [
        {{
          "day": 1,
          "session_name": "string",
          "type": "Strength|Speed|Agility|Mobility|Plyometric|Recovery",
          "duration_minutes": {session_mins},
          "warmup": ["item1", "item2"],
          "main_exercises": [
            {{
              "name": "string",
              "sets": 3,
              "reps": "8-10",
              "intensity_level": "Medium",
              "rest_seconds": 90,
              "coaching_cue": "string",
              "targets_bottleneck": "knee_stability"
            }}
          ],
          "cooldown": ["item1", "item2"],
          "recovery_notes": "string"
        }}
      ]
    }}
  ],
  "recovery_protocol": {{
    "daily_habits": ["habit1", "habit2"],
    "weekly_recovery_session": "string"
  }}
}}"""

    # ------------------------------------------------------------------
    # Built-in fallback plan (no LLM needed)
    # ------------------------------------------------------------------

    def _fallback_plan(self, athlete_profile: dict, bottlenecks: list) -> dict:
        sport = athlete_profile.get("sport", "sport")
        role = athlete_profile.get("role", "athlete")
        training_days = min(athlete_profile.get("training_days_per_week", 4), 6)
        session_mins = athlete_profile.get("session_duration_minutes", 60)
        top_attr = bottlenecks[0]["attribute"] if bottlenecks else "explosive_capacity"

        session_type_map = {
            "explosive_capacity":  ["Plyometric", "Speed", "Strength", "Agility", "Speed", "Strength"],
            "knee_stability":      ["Strength", "Mobility", "Strength", "Agility", "Strength", "Recovery"],
            "hip_mobility":        ["Mobility", "Strength", "Mobility", "Agility", "Strength", "Recovery"],
            "upper_body_posture":  ["Strength", "Mobility", "Strength", "Speed", "Strength", "Recovery"],
            "movement_symmetry":   ["Strength", "Agility", "Plyometric", "Strength", "Speed", "Recovery"],
            "flexibility":         ["Mobility", "Strength", "Mobility", "Agility", "Strength", "Recovery"],
            "balance":             ["Strength", "Agility", "Mobility", "Plyometric", "Strength", "Recovery"],
        }
        session_types = session_type_map.get(top_attr, ["Strength", "Speed", "Agility", "Strength", "Plyometric", "Recovery"])
        week_themes = ["Foundation & Movement Quality", "Load Accumulation", "Intensity Peak", "Consolidation & Reassessment"]

        templates = {
            "Strength": {
                "warmup": ["5 min light jog", "Leg swings x15 each", "Hip circles x10", "Glute bridges x15"],
                "exercises": [
                    {"name": "Goblet Squat", "sets": 3, "reps": "10-12", "intensity_level": "Medium", "rest_seconds": 90, "coaching_cue": "Chest up, knees track toes, full depth", "targets_bottleneck": "knee_stability"},
                    {"name": "Romanian Deadlift", "sets": 3, "reps": "8-10", "intensity_level": "Medium", "rest_seconds": 90, "coaching_cue": "Hip hinge, flat back, feel hamstring stretch", "targets_bottleneck": "hip_mobility"},
                    {"name": "Bulgarian Split Squat", "sets": 3, "reps": "8 each", "intensity_level": "Medium", "rest_seconds": 90, "coaching_cue": "Front knee stable, drive through heel", "targets_bottleneck": "movement_symmetry"},
                    {"name": "Plank Hold", "sets": 3, "reps": "40 sec", "intensity_level": "Low", "rest_seconds": 60, "coaching_cue": "Neutral spine, squeeze glutes and abs", "targets_bottleneck": "upper_body_posture"},
                ],
                "cooldown": ["Standing quad stretch 30s each", "Pigeon pose 60s each", "Thoracic rotations x10"],
            },
            "Speed": {
                "warmup": ["A-skips x20m x3", "High knees x20m x3", "Bounding x20m x2", "Strides x60m x2"],
                "exercises": [
                    {"name": "10m Acceleration Sprint", "sets": 6, "reps": "1", "intensity_level": "Max", "rest_seconds": 120, "coaching_cue": "Drive angle forward, pump arms, push not pull", "targets_bottleneck": "explosive_capacity"},
                    {"name": "30m Flying Sprint", "sets": 4, "reps": "1", "intensity_level": "Max", "rest_seconds": 180, "coaching_cue": "Tall posture, relaxed shoulders, high knee drive", "targets_bottleneck": "explosive_capacity"},
                    {"name": "Resisted Band Sprint", "sets": 4, "reps": "20m", "intensity_level": "High", "rest_seconds": 120, "coaching_cue": "Lean into resistance, drive each step hard", "targets_bottleneck": "explosive_capacity"},
                ],
                "cooldown": ["Easy jog 5 min", "Hip flexor stretch 60s each", "Calf stretch 30s each"],
            },
            "Agility": {
                "warmup": ["Lateral shuffles x10m x4", "Carioca x15m x3", "Hip openers x10 each", "Reactive jumps x10"],
                "exercises": [
                    {"name": "5-10-5 Pro Agility", "sets": 5, "reps": "1", "intensity_level": "High", "rest_seconds": 90, "coaching_cue": "Low hips at cut, plant outside foot, explode direction", "targets_bottleneck": "movement_symmetry"},
                    {"name": "T-Drill", "sets": 4, "reps": "1", "intensity_level": "High", "rest_seconds": 90, "coaching_cue": "Stay low, touch each cone cleanly", "targets_bottleneck": "balance"},
                    {"name": "Ladder Icky Shuffle", "sets": 4, "reps": "2 lengths", "intensity_level": "Medium", "rest_seconds": 60, "coaching_cue": "Soft foot contact, eyes forward, arms help rhythm", "targets_bottleneck": "movement_symmetry"},
                ],
                "cooldown": ["Light jog 5 min", "Ankle circles", "Hip flexor stretch", "Hamstring sweep"],
            },
            "Mobility": {
                "warmup": ["5 min walk", "Arm circles x15", "Leg swings x15 each"],
                "exercises": [
                    {"name": "World's Greatest Stretch", "sets": 3, "reps": "5 each side", "intensity_level": "Low", "rest_seconds": 30, "coaching_cue": "Lunge, rotate thorax, reach sky, hold 2s", "targets_bottleneck": "hip_mobility"},
                    {"name": "90/90 Hip Stretch", "sets": 3, "reps": "90 sec each", "intensity_level": "Low", "rest_seconds": 30, "coaching_cue": "Sit tall, hinge from hip, breathe into restriction", "targets_bottleneck": "hip_mobility"},
                    {"name": "Deep Squat Hold", "sets": 3, "reps": "60 sec", "intensity_level": "Low", "rest_seconds": 30, "coaching_cue": "Heels down, chest up, knees out", "targets_bottleneck": "flexibility"},
                    {"name": "Thoracic Extension Foam Roller", "sets": 3, "reps": "8 reps", "intensity_level": "Low", "rest_seconds": 30, "coaching_cue": "Roller at mid-back, arms crossed, exhale into extension", "targets_bottleneck": "upper_body_posture"},
                ],
                "cooldown": ["Box breathing 5 min", "Progressive muscle relaxation"],
            },
            "Plyometric": {
                "warmup": ["Jump rope 3 min", "Broad jumps x5", "Squat jumps x5", "Bounding x20m x2"],
                "exercises": [
                    {"name": "Box Jump", "sets": 4, "reps": "5", "intensity_level": "High", "rest_seconds": 120, "coaching_cue": "Swing arms, land soft bent knees, step down", "targets_bottleneck": "explosive_capacity"},
                    {"name": "Depth Drop to Jump", "sets": 4, "reps": "5", "intensity_level": "High", "rest_seconds": 120, "coaching_cue": "Step off box, land and immediately explode — minimise ground contact", "targets_bottleneck": "explosive_capacity"},
                    {"name": "Lateral Bound", "sets": 4, "reps": "8 each", "intensity_level": "High", "rest_seconds": 90, "coaching_cue": "Single-leg takeoff, land stable, hold 1s", "targets_bottleneck": "balance"},
                    {"name": "Hurdle Hop", "sets": 3, "reps": "6", "intensity_level": "High", "rest_seconds": 90, "coaching_cue": "Stiff ankle, minimal ground time", "targets_bottleneck": "explosive_capacity"},
                ],
                "cooldown": ["Easy walk 5 min", "Quad stretch 30s each", "Calf stretch 60s each"],
            },
            "Recovery": {
                "warmup": ["5 min gentle walk"],
                "exercises": [
                    {"name": "Full Body Foam Rolling", "sets": 1, "reps": "15 min", "intensity_level": "Low", "rest_seconds": 0, "coaching_cue": "Slow rolls, pause on tender spots 20-30s", "targets_bottleneck": "general"},
                    {"name": "Yoga Flow", "sets": 3, "reps": "5 rounds", "intensity_level": "Low", "rest_seconds": 30, "coaching_cue": "Breathe with each movement, don't force range", "targets_bottleneck": "flexibility"},
                    {"name": "Single-Leg Balance Hold", "sets": 2, "reps": "60 sec each", "intensity_level": "Low", "rest_seconds": 30, "coaching_cue": "Eyes closed for progression, soft knee, tall spine", "targets_bottleneck": "balance"},
                ],
                "cooldown": ["10 min guided breathing", "Light stretching"],
            },
        }

        weeks = []
        for week_num in range(1, 5):
            sessions = []
            for day_offset in range(training_days):
                s_type = session_types[day_offset % len(session_types)]
                tmpl = templates.get(s_type, templates["Strength"])
                exercises = []
                for ex in tmpl["exercises"]:
                    scaled = dict(ex)
                    if week_num >= 3 and scaled["intensity_level"] == "Medium":
                        scaled["intensity_level"] = "High"
                    exercises.append(scaled)
                sessions.append({
                    "day": day_offset + 1,
                    "session_name": f"{s_type} — Week {week_num}",
                    "type": s_type,
                    "duration_minutes": session_mins,
                    "warmup": tmpl["warmup"],
                    "main_exercises": exercises,
                    "cooldown": tmpl["cooldown"],
                    "recovery_notes": f"Week {week_num} {s_type.lower()} block. Log your RPE after this session.",
                })
            weeks.append({"week_number": week_num, "week_theme": week_themes[week_num - 1], "sessions": sessions})

        top_label = bottlenecks[0]["attribute"].replace("_", " ").title() if bottlenecks else "General Fitness"
        return {
            "_source": "fallback",
            "plan_title": f"4-Week {sport.title()} {role.replace('_', ' ').title()} Development Plan",
            "plan_summary": (
                f"This plan targets your top development gap — {top_label} — "
                f"through progressive {training_days}-day/week cycles. "
                f"Sessions escalate in intensity across 4 weeks, tailored to the demands "
                f"of a {role.replace('_', ' ')} in {sport}."
            ),
            "weeks": weeks,
            "recovery_protocol": {
                "daily_habits": [
                    "Sleep 8–9 hours with consistent wake time",
                    "Hydrate: 35 ml/kg bodyweight daily + extra during training",
                    "Post-training: 30g protein + 60g carbohydrate within 30 minutes",
                ],
                "weekly_recovery_session": "1 dedicated Recovery session per week (foam rolling, yoga, breathing).",
            },
        }
