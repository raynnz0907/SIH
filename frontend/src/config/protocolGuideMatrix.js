/**
 * PROTOCOL GUIDE MATRIX
 * Single Source of Truth for the 6 supported movement analysis protocols in the backend:
 * - cricket_batting
 * - football_strike
 * - basketball_jump_shot
 * - sprint_mechanics
 * - squat
 * - vertical_jump
 * 
 * Every protocol dynamically controls:
 * - title & short purpose
 * - "what we measure" metric chips
 * - camera placement & framing guide (4 steps)
 * - movement execution instructions & repetition count
 * - warnings & uploader action labels
 */

export const PROTOCOL_GUIDE_MATRIX = {
  football_strike: {
    protocolId: 'football_strike',
    name: 'Football Striking Mechanics',
    shortPurpose: 'Evaluates plant-leg knee stability under impact, striking hip whip, and torso lean over the ball.',
    category: 'sport_specific',
    metrics: [
      { label: 'Plant Knee Flex', desc: 'Eccentric shock absorption' },
      { label: 'Hip Extension', desc: 'Backswing whip generation' },
      { label: 'Torso Lean Angle', desc: 'Forward drive over ball' },
      { label: 'Landing Deceleration', desc: 'Post-strike braking balance' },
    ],
    cameraPlacement: '45-degree angle or side-on view, 3–5 meters from the ball at waist height.',
    framingRequirement: 'Full body framing throughout the entire approach run, plant foot contact, and follow-through landing.',
    repetitionCount: '2 to 3 natural strikes with dominant foot.',
    movementInstructions: 'Take a natural 2-to-3 step run-up, plant your support foot firmly beside the ball, strike through, and hold your landing balance.',
    warningMessage: 'Ensure both the ball contact area and your plant foot remain completely inside the camera frame.',
    uploadLabel: 'Record or Choose Football Strike Video',
    analyzeButtonLabel: 'Analyze Striking Mechanics',
    steps: [
      { step: 1, title: '45° or side-on angle', desc: 'Set camera 3–5 meters away at waist height, angled to capture approach, plant foot, and strike.' },
      { step: 2, title: 'Full body in frame', desc: 'Keep head to feet visible during the entire approach run, ball impact, and landing.' },
      { step: 3, title: '2–3 match strikes', desc: 'Strike a stationary or rolled ball with your dominant foot using full natural follow-through.' },
      { step: 4, title: 'Stable bright lighting', desc: 'Record outdoors or in bright indoor lighting to prevent motion blur on fast foot movement.' },
    ],
  },

  basketball_jump_shot: {
    protocolId: 'basketball_jump_shot',
    name: 'Jump Shot & Release Mechanics',
    shortPurpose: 'Tracks vertical elevation, shooting elbow alignment, release extension, and bilateral knee landing stability.',
    category: 'sport_specific',
    metrics: [
      { label: 'Elbow Alignment', desc: 'Vertical angle under ball' },
      { label: 'Release Elevation', desc: 'Peak jump height & timing' },
      { label: 'Flight Posture', desc: 'Upright torso without drift' },
      { label: 'Landing Symmetry', desc: 'Bilateral knee shock control' },
    ],
    cameraPlacement: 'Diagonal 45° side view, 4 meters away from your shooting spot at chest height.',
    framingRequirement: 'Full flight trajectory with ample vertical headroom so hands stay in frame at peak jump height.',
    repetitionCount: '2 to 3 game-speed jump shots.',
    movementInstructions: 'Set your base, elevate vertically into your shot without forward drift, extend your shooting arm at peak, and land balanced on both feet.',
    warningMessage: 'Leave enough vertical headroom above your head so your raised shooting hand does not clip the top of the video.',
    uploadLabel: 'Record or Choose Jump Shot Video',
    analyzeButtonLabel: 'Analyze Jump Shot Mechanics',
    steps: [
      { step: 1, title: 'Diagonal side view', desc: 'Position camera at chest height, 4 meters away from your shooting spot at roughly a 45° angle.' },
      { step: 2, title: 'Full flight trajectory', desc: 'Leave vertical headroom so your hands remain fully in frame at maximum jump elevation.' },
      { step: 3, title: '2–3 clean jumpers', desc: 'Take 2 to 3 game-speed jump shots with full release extension and balanced two-foot landing.' },
      { step: 4, title: 'Clear floor view', desc: 'Ensure your feet and landing surface are unobstructed by other players or equipment.' },
    ],
  },

  cricket_batting: {
    protocolId: 'cricket_batting',
    name: 'Front-Foot Drive Mechanics',
    shortPurpose: 'Assesses head position over ball, high front elbow, front-knee brace, and stroke follow-through stability.',
    category: 'sport_specific',
    metrics: [
      { label: 'Head Position', desc: 'Weight centered over ball' },
      { label: 'Front Elbow', desc: 'Leading high elbow elevation' },
      { label: 'Front Knee Brace', desc: 'Firm base resisting collapse' },
      { label: 'Stroke Balance', desc: 'Controlled finish & follow-through' },
    ],
    cameraPlacement: 'Perpendicular side-on view, 3–4 meters from your batting crease at waist height.',
    framingRequirement: 'Full body visible from footwear to the top of your raised bat in backlift and follow-through.',
    repetitionCount: '2 to 3 front-foot drives with natural tempo.',
    movementInstructions: 'Take your natural batting stance, trigger forward onto the front foot with head over knee, present the full bat face, and hold your stroke.',
    warningMessage: 'Record in consistent lighting with clear contrast between your clothing, bat, and background.',
    uploadLabel: 'Record or Choose Batting Drive Video',
    analyzeButtonLabel: 'Analyze Batting Mechanics',
    steps: [
      { step: 1, title: 'Perpendicular side-on', desc: 'Position camera at waist height, 3 to 4 meters perpendicular to your batting crease.' },
      { step: 2, title: 'Full body & bat in view', desc: 'Ensure your entire stance from footwear to raised bat or arm extension is clearly inside the frame.' },
      { step: 3, title: '2–3 controlled drives', desc: 'Perform 2 to 3 front-foot drive strokes with natural match tempo and follow-through.' },
      { step: 4, title: 'High contrast light', desc: 'Record in consistent lighting with high contrast between your clothing, equipment, and background.' },
    ],
  },

  sprint_mechanics: {
    protocolId: 'sprint_mechanics',
    name: 'Sprint Acceleration Biomechanics',
    shortPurpose: 'Analyzes forward drive lean angle, high knee recovery punch, hip extension, and bilateral stride rhythm.',
    category: 'sport_specific',
    metrics: [
      { label: 'Forward Lean', desc: 'Linear acceleration drive angle' },
      { label: 'Knee Punch', desc: 'High lead-knee drive elevation' },
      { label: 'Hip Extension', desc: 'Full trailing leg propulsion' },
      { label: 'Stride Rhythm', desc: 'Bilateral flight & ground contact' },
    ],
    cameraPlacement: 'Track-side perpendicular view, 4–6 meters from your lane at waist height.',
    framingRequirement: 'Wide lateral frame covering at least 5 to 7 meters so 3 consecutive full strides are captured.',
    repetitionCount: '1 to 2 sprint acceleration runs through the capture zone.',
    movementInstructions: 'Start 2 steps before the camera field, accelerate through the capture zone at 90–100% effort with forward torso lean and aggressive knee punch.',
    warningMessage: 'If your device supports 60 FPS recording, use it to ensure clean motion capture of rapid limb turnover.',
    uploadLabel: 'Record or Choose Sprint Acceleration Video',
    analyzeButtonLabel: 'Analyze Sprint Mechanics',
    steps: [
      { step: 1, title: 'Perpendicular track-side', desc: 'Place camera at waist height, 4–6 meters perpendicular to your sprint lane along the drive phase.' },
      { step: 2, title: 'Wide lateral frame', desc: 'Frame at least 5 to 7 meters of running lane so 3 full consecutive strides are visible.' },
      { step: 3, title: 'Accelerate through frame', desc: 'Start 2 steps before the camera field and sprint through the frame at 90–100% effort.' },
      { step: 4, title: '60 FPS recommended', desc: 'Record at 60 FPS if supported for maximum keypoint precision during rapid limb movement.' },
    ],
  },

  squat: {
    protocolId: 'squat',
    name: 'Squat Kinematics Baseline',
    shortPurpose: 'Evaluates eccentric knee stability, hip-to-ankle mobility, and trunk uprightness under bilateral movement.',
    category: 'foundation',
    metrics: [
      { label: 'Squat Depth', desc: 'Hip crease relative to parallel' },
      { label: 'Knee Valgus', desc: 'Lateral tracking over feet' },
      { label: 'Trunk Inclination', desc: 'Spine uprightness under descent' },
      { label: 'Bilateral Symmetry', desc: 'Even weight distribution' },
    ],
    cameraPlacement: 'Side-on or 45° angle, 2.5–3 meters away at knee-to-waist height.',
    framingRequirement: 'Entire body visible from feet flat on floor to top of head throughout complete descent and ascent.',
    repetitionCount: '3 continuous, controlled repetitions at a 2-second descent tempo.',
    movementInstructions: 'Stand with feet shoulder-width, descend under control until thighs reach parallel, maintain an upright chest and knees tracking over toes, then rise smoothly.',
    warningMessage: 'No bats, balls, or sports equipment needed. Wear fitted athletic clothing with visible knees.',
    uploadLabel: 'Record or Choose Squat Baseline Video',
    analyzeButtonLabel: 'Analyze Squat Kinematics',
    steps: [
      { step: 1, title: 'Side-on perspective', desc: 'Set phone at knee-to-waist height, 2.5 to 3 meters away, perpendicular to your squatting stance.' },
      { step: 2, title: 'Full athlete framing', desc: 'Keep feet, hips, and head fully in view throughout the lowest point of descent and full lockout.' },
      { step: 3, title: '3 controlled reps', desc: 'Perform 3 consecutive squats with a smooth 2-second descent, brief pause, and steady ascent.' },
      { step: 4, title: 'Unobstructed view', desc: 'Ensure knees and ankles are clearly visible without loose clothing covering joint lines.' },
    ],
  },

  vertical_jump: {
    protocolId: 'vertical_jump',
    name: 'Countermovement Jump Power Baseline',
    shortPurpose: 'Measures triple-extension explosive power, vertical displacement, and bilateral landing shock attenuation.',
    category: 'foundation',
    metrics: [
      { label: 'Takeoff RFD', desc: 'Explosive drive rate' },
      { label: 'Vertical Elevation', desc: 'Jump displacement peak' },
      { label: 'Landing Alignment', desc: 'Knee valgus shock control' },
      { label: 'Deceleration Brake', desc: 'Bilateral landing force absorption' },
    ],
    cameraPlacement: 'Direct side or front view, 3–4 meters away at waist height.',
    framingRequirement: 'Full athlete visible from floor contact up to maximum reach overhead with 1 meter of headroom.',
    repetitionCount: '2 to 3 maximal countermovement jumps with 3-second resets.',
    movementInstructions: 'Stand tall with feet hip-width, dip quickly into a quarter-squat, explode upward with maximal arm swing, and land softly on both feet.',
    warningMessage: 'Land softly on both feet simultaneously to demonstrate shock absorption and prevent knee collapse.',
    uploadLabel: 'Record or Choose Vertical Jump Video',
    analyzeButtonLabel: 'Analyze Vertical Jump Power',
    steps: [
      { step: 1, title: 'Direct side or front', desc: 'Position camera at waist height, 3 to 4 meters away from your jumping spot on a flat floor.' },
      { step: 2, title: 'Generous overhead space', desc: 'Leave at least 1 meter of vertical headroom above your reach so you remain inside frame at the peak.' },
      { step: 3, title: '2–3 maximal jumps', desc: 'Perform 2 to 3 maximal countermovement jumps, landing softly and resetting between repetitions.' },
      { step: 4, title: 'Both feet visible', desc: 'Ensure your feet and landing surface are clearly in view to evaluate bilateral landing control.' },
    ],
  },
};

/**
 * Get protocol guide by protocol ID with safe fallback
 */
export const getProtocolGuide = (protocolId) => {
  return PROTOCOL_GUIDE_MATRIX[protocolId] || PROTOCOL_GUIDE_MATRIX.vertical_jump;
};
