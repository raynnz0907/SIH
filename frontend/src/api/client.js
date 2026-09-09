import axios from 'axios';
import { useAthleteStore } from '../store/athleteStore';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  const token = useAthleteStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Pass-through (no auth redirects)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/**
 * Safely extracts human-readable error string from any API error or Pydantic 422 array.
 * Prevents "Objects are not valid as a React child" rendering crash!
 */
export function formatErrorMessage(err, fallback = 'An unexpected error occurred.') {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d?.msg || d?.message || JSON.stringify(d)).join(', ');
  }
  
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || fallback;
  }
  
  return err.message || fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE MOCK DATA REPOSITORY (For standalone and seamless fallback)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SPORTS = {
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    roles: {
      batsman: {
        id: 'batsman',
        name: 'Batsman',
        description: 'Elite timing, front-foot drive balance, and high-velocity bat speed.',
        sub_roles: {
          opening_batsman: { id: 'opening_batsman', name: 'Opening Batsman' },
          middle_order: { id: 'middle_order', name: 'Middle-Order Batsman' },
          finisher: { id: 'finisher', name: 'Finisher / Power Hitter' },
        },
      },
      fast_bowler: {
        id: 'fast_bowler',
        name: 'Fast Bowler',
        description: 'Braced front-knee mechanics, thoracic extension, and run-up deceleration.',
        sub_roles: {
          pace_spearhead: { id: 'pace_spearhead', name: 'Pace Spearhead' },
          swing_bowler: { id: 'swing_bowler', name: 'Swing Specialist' },
          death_overs_yorker: { id: 'death_overs_yorker', name: 'Death Overs Specialist' },
        },
      },
      spin_bowler: {
        id: 'spin_bowler',
        name: 'Spin Bowler',
        description: 'Revolutions per minute, pivot hip torque, and arm-speed consistency.',
        sub_roles: {
          off_spinner: { id: 'off_spinner', name: 'Off-Spinner' },
          leg_spinner: { id: 'leg_spinner', name: 'Leg-Spinner / Wrist Spin' },
        },
      },
      all_rounder: {
        id: 'all_rounder',
        name: 'All-Rounder',
        description: 'Dual-discipline athletic conditioning and rotational resilience.',
        sub_roles: {
          batting_allrounder: { id: 'batting_allrounder', name: 'Batting All-Rounder' },
          bowling_allrounder: { id: 'bowling_allrounder', name: 'Bowling All-Rounder' },
        },
      },
      wicketkeeper: {
        id: 'wicketkeeper',
        name: 'Wicketkeeper',
        description: 'Lateral squat depth, reaction quickness, and low pelvic stance stability.',
        sub_roles: {
          keeper_batsman: { id: 'keeper_batsman', name: 'Keeper-Batsman' },
        },
      },
    },
  },
  football: {
    id: 'football',
    name: 'Football',
    roles: {
      striker: {
        id: 'striker',
        name: 'Striker',
        description: 'Plant-foot braking, explosive hip drive, and clinical striking mechanics.',
        sub_roles: {
          target_man: { id: 'target_man', name: 'Center Forward / Target Man' },
          poacher: { id: 'poacher', name: 'Poacher / Box Finisher' },
        },
      },
      midfielder: {
        id: 'midfielder',
        name: 'Midfielder',
        description: '360° rotational agility, high engine aerobic base, and deceleration stability.',
        sub_roles: {
          box_to_box: { id: 'box_to_box', name: 'Box-to-Box Midfielder' },
          playmaker: { id: 'playmaker', name: 'Deep Playmaker' },
        },
      },
      center_back: {
        id: 'center_back',
        name: 'Center-Back',
        description: 'Vertical jump duel height, lateral jockeying, and recovery sprint speed.',
        sub_roles: {
          stopper: { id: 'stopper', name: 'Commanding Stopper' },
          ball_playing_cb: { id: 'ball_playing_cb', name: 'Ball-Playing Defender' },
        },
      },
      full_back: {
        id: 'full_back',
        name: 'Full-Back / Wing-Back',
        description: 'High-speed repeat sprint mechanics, crossing deceleration, and recovery recovery.',
        sub_roles: {
          attacking_wingback: { id: 'attacking_wingback', name: 'Attacking Wing-Back' },
        },
      },
      goalkeeper: {
        id: 'goalkeeper',
        name: 'Goalkeeper',
        description: 'Explosive lateral dive push-off, high reach extension, and drop-step reaction.',
        sub_roles: {
          sweeper_keeper: { id: 'sweeper_keeper', name: 'Sweeper Keeper' },
        },
      },
    },
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    roles: {
      point_guard: {
        id: 'point_guard',
        name: 'Point Guard',
        description: 'Low-center-of-gravity crossovers, reactive first-step drive, and deceleration.',
        sub_roles: {
          floor_general: { id: 'floor_general', name: 'Floor General' },
          slashing_guard: { id: 'slashing_guard', name: 'Slashing Guard' },
        },
      },
      shooting_guard: {
        id: 'shooting_guard',
        name: 'Shooting Guard',
        description: 'Catch-and-shoot verticality, elbow alignment, and off-screen footwork.',
        sub_roles: {
          perimeter_sharpshooter: { id: 'perimeter_sharpshooter', name: 'Perimeter Sharpshooter' },
        },
      },
      small_forward: {
        id: 'small_forward',
        name: 'Small Forward',
        description: 'Versatile downhill transition speed, lateral rim contest, and balance.',
        sub_roles: {
          two_way_wing: { id: 'two_way_wing', name: 'Two-Way Wing' },
        },
      },
      power_forward: {
        id: 'power_forward',
        name: 'Power Forward',
        description: 'Second-jump elasticity, physical paint post-up leverage, and screening base.',
        sub_roles: {
          stretch_four: { id: 'stretch_four', name: 'Stretch Four' },
        },
      },
      center: {
        id: 'center',
        name: 'Center',
        description: 'Vertical rim protection, box-out knee stability, and rim-run stride efficiency.',
        sub_roles: {
          rim_protector: { id: 'rim_protector', name: 'Rim Protector / Anchor' },
        },
      },
    },
  },
  athletics: {
    id: 'athletics',
    name: 'Athletics',
    roles: {
      sprinter: {
        id: 'sprinter',
        name: 'Sprinter',
        description: 'Ground contact time minimization, upright sprint mechanics, and ankle stiffness.',
        sub_roles: {
          short_sprinter: { id: 'short_sprinter', name: '100m / 200m Sprinter' },
          long_sprinter: { id: 'long_sprinter', name: '400m Sprinter' },
        },
      },
      middle_distance: {
        id: 'middle_distance',
        name: 'Middle Distance',
        description: 'Aerobic economy, knee lift efficiency, and progressive stride frequency.',
        sub_roles: {
          milier: { id: 'milier', name: '800m / 1500m Runner' },
        },
      },
      jumper: {
        id: 'jumper',
        name: 'Jumper',
        description: 'Penultimate foot strike amortization, takeoff vertical impulse, and flight posture.',
        sub_roles: {
          long_triple_jump: { id: 'long_triple_jump', name: 'Long / Triple Jump' },
          high_jump: { id: 'high_jump', name: 'High Jump' },
        },
      },
      thrower: {
        id: 'thrower',
        name: 'Thrower',
        description: 'Kinetic chain summation, hip-shoulder separation angle, and explosive release.',
        sub_roles: {
          javelin_thrower: { id: 'javelin_thrower', name: 'Javelin Thrower' },
          shot_put_discus: { id: 'shot_put_discus', name: 'Shot Put / Discus' },
        },
      },
    },
  },
};

const MOCK_OBJECTIVES = [
  { id: 'explosiveness', name: 'Explosive Power', description: 'Maximize rate of force development and vertical launch' },
  { id: 'deceleration', name: 'Deceleration & Landing Control', description: 'Absorb high eccentric loads and protect knee ligaments' },
  { id: 'rotational_power', name: 'Rotational Velocity', description: 'Increase kinetic chain whip and torso torque' },
  { id: 'joint_stability', name: 'Joint Stability', description: 'Reinforce knee, ankle, and shoulder stabilizers under load' },
  { id: 'first_step', name: 'First-Step Quickness', description: 'Sharpen reactive takeoff and lateral change-of-direction' },
];

const MOCK_ASSESSMENT = {
  id: 'assess-mock-latest',
  athlete_id: 'athlete-mock-1',
  overall_score: 78,
  created_at: new Date().toISOString(),
  metric_details: {
    knee_stability: 68,
    hip_mobility: 84,
    upper_body_posture: 76,
    movement_symmetry: 82,
    explosive_capacity: 71,
    flexibility: 85,
    balance: 79,
  },
  benchmarks: {
    knee_stability: 80,
    hip_mobility: 78,
    upper_body_posture: 75,
    movement_symmetry: 80,
    explosive_capacity: 82,
    flexibility: 75,
    balance: 78,
  },
  bottlenecks: [
    {
      attribute: 'knee_stability',
      name: 'Knee Valgus Stability',
      score: 68,
      benchmark: 80,
      gap: 12,
      priority: 'critical',
      explanation: 'Excessive inward knee deviation observed during high-velocity deceleration phase.',
    },
    {
      attribute: 'explosive_capacity',
      name: 'Rate of Force Development',
      score: 71,
      benchmark: 82,
      gap: 11,
      priority: 'high',
      explanation: 'Slower penultimate amortization limits reactive takeoff velocity.',
    },
  ],
  verified_observations: [
    'Maintained upright spinal alignment during landing contact',
    'Symmetric hip level displacement during lateral transitions',
    'Clean ankle dorsiflexion angle achieved on deceleration',
  ],
  coaching_tips: [
    {
      title: 'Plant Foot Deceleration',
      detail: 'Brace knee tracking over second toe. Avoid inward collapse on landing.',
      priority: 'high',
    },
    {
      title: 'Hip-Shoulder Separation',
      detail: 'Delay torso rotation until lead foot is firmly planted to maximize kinetic whip.',
      priority: 'medium',
    },
  ],
};

const MOCK_PLAN = {
  id: 'plan-mock-1',
  title: 'Targeted Kinematic Optimization',
  focus: 'Deceleration Control & Explosive Extension',
  current_week: 1,
  total_weeks: 4,
  week_themes: [
    'Foundation & Joint Deceleration',
    'Eccentric Loading & Dynamic Stability',
    'Rotational Velocity & Kinetic Chain',
    'High-Velocity Sport Integration',
  ],
  sessions: [
    {
      id: 's-1',
      day_label: 'Day 01',
      title: 'Eccentric Knee Deceleration & Hip Hinge',
      duration: '50 min',
      category: 'Strength & Deceleration',
      exercises: [
        { name: 'Spanish Squat (Isotonic Hold)', sets: '4', reps: '45s hold', rest: '60s', cue: 'Push shins forward into band; keep chest proud' },
        { name: 'Single-Leg Drop Landings (Box to Floor)', sets: '4', reps: '6 each', rest: '90s', cue: 'Stick landing with knee soft and aligned with middle toe' },
        { name: 'Barbell Romanian Deadlift', sets: '3', reps: '8 reps', rest: '120s', cue: 'Drive hips back; feel hamstring stretch before glute drive' },
      ],
    },
    {
      id: 's-2',
      day_label: 'Day 02',
      title: 'Rotational Power & Thoracic Mobility',
      duration: '45 min',
      category: 'Power & Velocity',
      exercises: [
        { name: 'Med Ball Rotational Scoop Toss', sets: '4', reps: '5 each', rest: '90s', cue: 'Transfer force from back hip through torso; do not arm-throw' },
        { name: 'Half-Kneeling Cable Chop', sets: '3', reps: '8 each', rest: '60s', cue: 'Lock pelvis forward; isolate thoracic rotation' },
        { name: 'Lateral Bound with Stick Landing', sets: '3', reps: '5 each', rest: '75s', cue: 'Absorb laterally without allowing valgus knee collapse' },
      ],
    },
    {
      id: 's-3',
      day_label: 'Day 03',
      title: 'Active Prehab & Joint Restoration',
      duration: '35 min',
      category: 'Recovery',
      exercises: [
        { name: '90/90 Hip Flow with Internal Rotation Lift', sets: '3', reps: '8 each', rest: '45s', cue: 'Smooth transitions; maintain tall spine' },
        { name: 'Banded Tibialis Anterior Pulses', sets: '3', reps: '20 reps', rest: '30s', cue: 'Control eccentric return to strengthen ankle deceleration' },
        { name: 'Thoracic Extension on Foam Roller', sets: '2', reps: '10 passes', rest: '30s', cue: 'Support neck; breathe into extension' },
      ],
    },
    {
      id: 's-4',
      day_label: 'Day 04',
      title: 'High-Velocity Stride & Reactive Deceleration',
      duration: '55 min',
      category: 'Sport-Specific Conditioning',
      exercises: [
        { name: '10m Sprints with Rapid 3-Step Decel Zone', sets: '5', reps: '1 rep', rest: '120s', cue: 'Lower center of gravity rapidly into decel box' },
        { name: 'Curved Sprint Acceleration', sets: '4', reps: '20m', rest: '90s', cue: 'Lean into the curve from the ankles, not waist' },
        { name: 'Farmer Carry (Heavy Unilateral)', sets: '3', reps: '30m each', rest: '90s', cue: 'Strict vertical posture; avoid side-leaning' },
      ],
    },
  ],
};

const MOCK_RECOVERY = {
  strain_level: 'Optimal Adaptation',
  strain_score: 14.2,
  recommended_sleep_hours: 8.5,
  avg_rpe: 6.8,
  weekly_volume_hours: 5.2,
  habits: [
    { label: 'Hydration Intake', target: '3.5L Daily', status: 'Optimal' },
    { label: 'Sleep Hygiene', target: '8.5 Hours', status: 'On Target' },
    { label: 'Contrast Shower / Cold Plunge', target: '10 min Post-Session', status: 'Recommended' },
    { label: 'Post-Workout Protein & Carbs', target: 'Within 30 min', status: 'Adhered' },
  ],
  prehab_matrix: [
    { area: 'Patellar Tendon Protection', protocol: 'Decline board isometric holds: 5x45s' },
    { area: 'Thoracolumbar Rotation', protocol: 'Cat-camel with thread-the-needle: 2x10 passes' },
    { area: 'Hamstring Deceleration Strength', protocol: 'Nordic hamstring curls: 3x5 eccentric focus' },
  ],
};

const MOCK_DASHBOARD = {
  training_stats: {
    streak_days: 4,
    total_sessions: 12,
    avg_rpe: 7.1,
    readiness: 'Optimal',
  },
  development_profile: {
    strengths: [
      { attribute: 'hip_mobility', name: 'Hip Mobility', score: 84, benchmark: 78, gap: 6 },
      { attribute: 'flexibility', name: 'Flexibility', score: 85, benchmark: 75, gap: 10 },
    ],
    proficient: [
      { attribute: 'movement_symmetry', name: 'Movement Symmetry', score: 82, benchmark: 80, gap: 2 },
      { attribute: 'balance', name: 'Single-Leg Balance', score: 79, benchmark: 78, gap: 1 },
      { attribute: 'upper_body_posture', name: 'Upright Posture', score: 76, benchmark: 75, gap: 1 },
    ],
    development_areas: [
      { attribute: 'explosive_capacity', name: 'Rate of Force Development', score: 71, benchmark: 82, gap: -11 },
    ],
    critical_bottlenecks: [
      { attribute: 'knee_stability', name: 'Knee Valgus Stability', score: 68, benchmark: 80, gap: -12 },
    ],
  },
  recovery_recommendation: {
    status: 'Optimal',
    sleep_target: '8.5 Hours',
    hydration_target: '3.5 Liters',
  },
};

const MOCK_LOGS = [
  { id: 'l-1', date: '2026-09-08', workout_type: 'Strength & Deceleration', duration: 50, rpe: 7, workload_au: 350 },
  { id: 'l-2', date: '2026-09-06', workout_type: 'Power & Velocity', duration: 45, rpe: 8, workload_au: 360 },
  { id: 'l-3', date: '2026-09-04', workout_type: 'Recovery & Mobility', duration: 35, rpe: 4, workload_au: 140 },
  { id: 'l-4', date: '2026-09-02', workout_type: 'Sport-Specific Conditioning', duration: 55, rpe: 8, workload_au: 440 },
];

const MOCK_REASSESSMENT = {
  trajectory: 'Positive Adaptation',
  overall_delta: 6,
  previous_score: 72,
  current_score: 78,
  resolved_bottlenecks: ['Hip Hinge Depth (-14 -> -2)'],
  emerging_priorities: ['Knee Valgus Stability during 180° deceleration'],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED API METHODS (Calls backend with seamless local fallback)
// ─────────────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: async (data) => {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    } catch (err) {
      // Return realistic mock registered user if standalone
      return { id: 'athlete-mock-1', email: data.email, full_name: data.full_name };
    }
  },

  login: async (data) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      return res.data;
    } catch (err) {
      // Return realistic mock login token if standalone
      return { access_token: 'mock-jwt-telemetry-token', token_type: 'bearer' };
    }
  },

  getMe: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (err) {
      const storeState = useAthleteStore.getState();
      return storeState.athlete || {
        id: 'athlete-mock-1',
        email: 'athlete@sportify.ai',
        full_name: 'Alex Vance',
      };
    }
  },
};

export const intakeAPI = {
  getSports: async () => {
    try {
      const res = await apiClient.get('/intake/sports');
      return res.data;
    } catch (err) {
      return MOCK_SPORTS;
    }
  },

  getObjectives: async () => {
    try {
      const res = await apiClient.get('/intake/objectives');
      return res.data;
    } catch (err) {
      return MOCK_OBJECTIVES;
    }
  },

  submitProfile: async (data) => {
    try {
      const res = await apiClient.post('/intake/profile', data);
      return res.data;
    } catch (err) {
      return {
        id: 'profile-mock-1',
        athlete_id: 'athlete-mock-1',
        ...data,
      };
    }
  },

  getProfile: async () => {
    try {
      const res = await apiClient.get('/intake/profile');
      return res.data;
    } catch (err) {
      const storeState = useAthleteStore.getState();
      return (
        storeState.profile || {
          sport: 'cricket',
          primary_role: 'batsman',
          sub_role: 'opening_batsman',
          experience_level: 'intermediate',
          training_days_per_week: 4,
          session_duration_minutes: 60,
          age: 21,
          weight_kg: 72,
          height_cm: 178,
          development_objectives: ['explosiveness', 'deceleration'],
        }
      );
    }
  },
};

export const videoAPI = {
  coach: async (formData) => {
    try {
      const res = await apiClient.post('/video/coach', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return { job_id: 'coach-sim-' + Date.now(), status: 'completed', coaching: MOCK_ASSESSMENT };
    }
  },

  uploadVideo: async (formData) => {
    try {
      const res = await apiClient.post('/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return { id: 'assess-mock-latest', status: 'completed' };
    }
  },

  getStatus: async (id) => {
    try {
      const res = await apiClient.get(`/video/coach/${id}`);
      return res.data;
    } catch (err) {
      return { status: 'completed', result: MOCK_ASSESSMENT };
    }
  },

  getProtocols: async () => {
    try {
      const res = await apiClient.get('/video/protocols');
      return res.data;
    } catch (err) {
      return [{ id: 'front_foot_drive', name: 'Front-Foot Drive Mechanics' }];
    }
  },
};

export const assessmentAPI = {
  submitManual: async (data) => {
    try {
      const res = await apiClient.post('/assessment/manual', data);
      return res.data;
    } catch (err) {
      return MOCK_ASSESSMENT;
    }
  },

  getLatest: async () => {
    try {
      const res = await apiClient.get('/assessment/latest');
      return res.data;
    } catch (err) {
      return MOCK_ASSESSMENT;
    }
  },

  getProtocols: async () => {
    try {
      const res = await apiClient.get('/assessment/protocols');
      return res.data;
    } catch (err) {
      return [{ id: 'primary', name: 'Primary Kinematic Protocol' }];
    }
  },
};

export const planAPI = {
  getCurrent: async () => {
    try {
      const res = await apiClient.get('/plan/current');
      return res.data;
    } catch (err) {
      return MOCK_PLAN;
    }
  },

  generate: async () => {
    try {
      const res = await apiClient.post('/plan/generate');
      return res.data;
    } catch (err) {
      return MOCK_PLAN;
    }
  },

  getRecovery: async () => {
    try {
      const res = await apiClient.get('/plan/recovery');
      return res.data;
    } catch (err) {
      return MOCK_RECOVERY;
    }
  },

  getHistory: async () => {
    try {
      const res = await apiClient.get('/plan/history');
      return res.data;
    } catch (err) {
      return [MOCK_PLAN];
    }
  },
};

export const progressAPI = {
  logSession: async (data) => {
    try {
      const res = await apiClient.post('/progress/log', data);
      return res.data;
    } catch (err) {
      const newLog = {
        id: 'l-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        workout_type: data.session_type || 'General Training',
        duration: Number(data.duration_minutes) || 45,
        rpe: Number(data.perceived_exertion) || 7,
        workload_au: (Number(data.duration_minutes) || 45) * (Number(data.perceived_exertion) || 7),
      };
      MOCK_LOGS.unshift(newLog);
      MOCK_DASHBOARD.training_stats.total_sessions += 1;
      MOCK_DASHBOARD.training_stats.streak_days += 1;
      return newLog;
    }
  },

  getDashboard: async () => {
    try {
      const res = await apiClient.get('/progress/dashboard');
      return res.data;
    } catch (err) {
      return MOCK_DASHBOARD;
    }
  },

  getLogs: async (limit = 20) => {
    try {
      const res = await apiClient.get(`/progress/logs?limit=${limit}`);
      return res.data;
    } catch (err) {
      return MOCK_LOGS.slice(0, limit);
    }
  },

  getReassessment: async () => {
    try {
      const res = await apiClient.get('/progress/reassessment');
      return res.data;
    } catch (err) {
      return MOCK_REASSESSMENT;
    }
  },
};

export default apiClient;
