/**
 * ROLE ASSESSMENT MATRIX
 * Unified mapping of athlete sport & role taxonomy to supported capabilities.
 * Uses exact role IDs (NO fuzzy matching or `.includes()` heuristics).
 *
 * Supported Protocols in Backend:
 * - cricket_batting
 * - football_strike
 * - basketball_jump_shot
 * - sprint_mechanics
 * - squat
 * - vertical_jump
 */

export const ROLE_ASSESSMENT_MATRIX = {
  // ─── CRICKET ─────────────────────────────────────────────────────────────
  cricket: {
    batsman: {
      roleTitle: 'Cricket Batsman',
      pageTitle: 'Batting Drive Mechanics',
      recommendedProtocolId: 'cricket_batting',
      capabilityStatus: 'available', // 'available' | 'foundation' | 'coming_soon'
      shortPurpose: 'Evaluates head position over ball, high front elbow, knee brace, and stroke follow-through.',
      roleReason: 'Drive mechanics anchor your run scoring against pace and spin by establishing head-over-ball balance.',
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: null,
    },

    bowler: {
      roleTitle: 'Cricket Bowler',
      pageTitle: 'Bowling Power & Deceleration Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Bowling Power Baseline',
      shortPurpose: 'Evaluates lower-body force production and landing shock attenuation essential for delivery stride stability.',
      roleReason: 'Measures lower-body impulse and bilateral landing deceleration needed to absorb 8–10x bodyweight delivery shock.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Bowling delivery analysis is coming soon',
        description: 'Run-up stride pacing and bowling release arm-speed tracking are in active development. Complete your lower-body power baseline below to establish your kinetic foundation.',
      },
    },

    all_rounder: {
      roleTitle: 'Cricket All-Rounder',
      pageTitle: 'All-Rounder Kinetic Assessment',
      recommendedProtocolId: 'cricket_batting',
      capabilityStatus: 'available',
      shortPurpose: 'Choose your focus today: technical front-foot batting mechanics or bowling lower-body power baseline.',
      roleReason: 'Dual-threat athletes need both front-foot batting stability and explosive gather deceleration.',
      allowFocusChoice: true,
      focusChoices: [
        { protocolId: 'cricket_batting', label: 'Batting Mechanics Focus', status: 'available' },
        { protocolId: 'vertical_jump', label: 'Bowling Power Baseline Focus', status: 'foundation' },
      ],
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: {
        type: 'info',
        title: 'Choose your training focus',
        description: 'As an all-rounder, you can assess batting drive mechanics or establish your lower-body bowling power baseline below.',
      },
    },

    wicket_keeper: {
      roleTitle: 'Wicketkeeper',
      pageTitle: 'Wicketkeeper Crouch Mobility & Base',
      recommendedProtocolId: 'squat',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Crouch Mobility & Knee Baseline',
      shortPurpose: 'Tests deep hip-to-ankle flexion and eccentric knee stability for staying low across extended spells.',
      roleReason: 'Wicketkeeping requires hours in deep crouch stance; knee tracking and hip range prevent postural collapse.',
      foundationalChoices: ['vertical_jump'],
      notice: {
        type: 'info',
        title: 'Dedicated glovework analysis is coming soon',
        description: 'Specialist standing-up reaction speed and lateral diving metrics are currently in development. Complete your crouch mobility baseline below.',
      },
    },
  },

  // ─── FOOTBALL ────────────────────────────────────────────────────────────
  football: {
    striker: {
      roleTitle: 'Football Striker',
      pageTitle: 'Shot Power & Finishing Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      shortPurpose: 'Evaluates plant-leg stability, hip whip rotation, and forward torso control over the ball.',
      roleReason: 'Clean ball impact requires plant-knee deceleration and forward torso lean to keep powerful shots on target.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    winger: {
      roleTitle: 'Winger / Wide Forward',
      pageTitle: 'Crossing & Striking Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      overrideProtocolName: 'Crossing & Striking Mechanics',
      shortPurpose: 'Assesses plant-leg braking, rotational hip whip, and deceleration balance during delivery.',
      roleReason: 'Whipping crosses on the run demands plant-knee stability and dynamic torso rotational control.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    central_midfielder: {
      roleTitle: 'Central Midfielder',
      pageTitle: 'Passing & Ball-Strike Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      overrideProtocolName: 'Passing & Ball-Strike Mechanics',
      shortPurpose: 'Measures plant-foot alignment, hip rotation, and torso balance during ball distribution.',
      roleReason: 'Consistent distribution requires stable plant-knee flexion and repeatable follow-through mechanics.',
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: null,
    },

    centre_back: {
      roleTitle: 'Centre Back / Defender',
      pageTitle: 'Clearance Strike & Deceleration',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      overrideProtocolName: 'Clearance Strike & Deceleration',
      shortPurpose: 'Assesses striking mechanics under defensive clearance loads and single-leg deceleration control.',
      roleReason: 'High-pressure clearances demand grounded plant-knee stability and safe deceleration mechanics.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    goalkeeper: {
      roleTitle: 'Goalkeeper',
      pageTitle: 'Goalkeeper Aerial & Lateral Power Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Goalkeeper Elevation & Deceleration',
      shortPurpose: 'Measures vertical takeoff impulse and bilateral shock absorption for aerial cross claims.',
      roleReason: 'Shot stoppers require explosive vertical drive to claim high balls and resilient landing shock absorption.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Goalkeeper diving and reflex analysis is coming soon',
        description: 'Lateral dive extension and reaction-window kinematics are in development. Complete your vertical power and landing baseline below.',
      },
    },
  },

  // ─── BASKETBALL ──────────────────────────────────────────────────────────
  basketball: {
    point_guard: {
      roleTitle: 'Point Guard',
      pageTitle: 'Pull-Up Jump Shot & Balance',
      recommendedProtocolId: 'basketball_jump_shot',
      capabilityStatus: 'available',
      shortPurpose: 'Tracks vertical elevation, shooting elbow alignment, and landing symmetry under momentum.',
      roleReason: 'Pull-up shooting off rapid drives demands zero horizontal drift and balanced two-foot landing deceleration.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    shooting_guard: {
      roleTitle: 'Shooting Guard',
      pageTitle: 'Catch-and-Shoot Release Mechanics',
      recommendedProtocolId: 'basketball_jump_shot',
      capabilityStatus: 'available',
      overrideProtocolName: 'Catch-and-Shoot Release Mechanics',
      shortPurpose: 'Evaluates elbow alignment at release, jump peak timing, and symmetrical knee landing control.',
      roleReason: 'Consistent perimeter shooting relies on repeatable vertical alignment and rapid elbow extension.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    small_forward: {
      roleTitle: 'Small Forward',
      pageTitle: 'Mid-Range Jump Shot Mechanics',
      recommendedProtocolId: 'basketball_jump_shot',
      capabilityStatus: 'available',
      shortPurpose: 'Measures shooting elevation, upright torso flight posture, and landing shock attenuation.',
      roleReason: 'Mid-range shot consistency demands vertical takeoff without forward fade and soft knee deceleration.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    power_forward: {
      roleTitle: 'Power Forward',
      pageTitle: 'Interior Elevation & Landing Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Interior Elevation & Deceleration',
      shortPurpose: 'Measures vertical leap displacement and bilateral landing knee valgus for contested rebounding.',
      roleReason: 'Battling for offensive and defensive boards requires maximal vertical displacement and resilient landing mechanics.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Post and rebounding mechanics analysis is coming soon',
        description: 'Post footwork, drop-step tracking, and box-out positioning kinematics are in development. Establish your vertical foundation below.',
      },
    },

    center: {
      roleTitle: 'Center',
      pageTitle: 'Rim Protection & Vertical Power Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Rim Protection Elevation Baseline',
      shortPurpose: 'Evaluates vertical reach elevation and bilateral knee shock control for shot-blocking contests.',
      roleReason: 'Rim protectors must contest without fouling by elevating straight up and absorbing heavy landing impacts.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Rim protection and post mechanics analysis is coming soon',
        description: 'Contest verticality and low-post anchor mechanics tracking are currently planned. Complete your vertical baseline below.',
      },
    },
  },

  // ─── ATHLETICS ───────────────────────────────────────────────────────────
  athletics: {
    sprinter: {
      roleTitle: 'Sprinter',
      pageTitle: 'Sprint Acceleration Biomechanics',
      recommendedProtocolId: 'sprint_mechanics',
      capabilityStatus: 'available',
      shortPurpose: 'Analyzes forward drive lean angle, lead knee recovery punch, full hip extension, and stride rhythm.',
      roleReason: 'Maximal velocity generation requires an aggressive forward drive angle and high front-knee elevation.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    middle_distance: {
      roleTitle: 'Middle Distance Runner',
      pageTitle: 'Acceleration Mechanics Baseline',
      recommendedProtocolId: 'sprint_mechanics',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Acceleration Mechanics Baseline',
      shortPurpose: 'Evaluates drive phase posture and bilateral stride rhythm relevant to kick acceleration.',
      roleReason: 'Analyzes acceleration posture and cadence symmetry when kicking for the finish line.',
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: {
        type: 'info',
        title: 'Distance running efficiency analysis is planned',
        description: 'Aerobic economy and sustained stride pacing kinematics are currently in development. Complete your acceleration mechanics baseline below.',
      },
    },

    jumper: {
      roleTitle: 'Jumper (High / Long / Triple)',
      pageTitle: 'Takeoff Impulse & Elastic Power Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Takeoff Elastic Power Baseline',
      shortPurpose: 'Measures stretch-shortening cycle rate of force development and vertical displacement.',
      roleReason: 'Converting horizontal velocity into takeoff height demands maximal lower-limb elasticity and impulse.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Event-specific takeoff analysis is coming soon',
        description: 'Penultimate stride lowering and flight trajectory tracking are currently in active research. Complete your elastic power baseline below.',
      },
    },

    thrower: {
      roleTitle: 'Thrower (Shot / Discus / Javelin)',
      pageTitle: 'Kinetic Base & Mobility Baseline',
      recommendedProtocolId: 'squat',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Rotational Base & Hip Mobility Squat',
      shortPurpose: 'Evaluates hip-to-ankle mobility and eccentric knee stability for deep rotational power positions.',
      roleReason: 'Power generation in throws begins from a grounded, deep hip hinge and stable lower-body base.',
      foundationalChoices: ['vertical_jump'],
      notice: {
        type: 'info',
        title: 'Rotational throwing mechanics analysis is coming soon',
        description: 'Thoracic rotational velocity and release angle kinematics are currently in development. Complete your lower-body kinetic foundation below.',
      },
    },
  },
};

/**
 * Safely retrieve role assessment configuration using exact taxonomy keys.
 * Falls back safely to sport default if role is not found.
 */
export const getRoleAssessmentConfig = (sportKey, roleKey) => {
  const sport = ROLE_ASSESSMENT_MATRIX[sportKey];
  if (!sport) {
    return null;
  }

  // Exact match
  if (roleKey && sport[roleKey]) {
    return sport[roleKey];
  }

  // Fallback aliases for common variations without fuzzy matching
  const aliasMap = {
    football: {
      defender: 'centre_back',
      forward: 'striker',
      midfield: 'central_midfielder',
      midfielder: 'central_midfielder',
    },
    cricket: {
      batter: 'batsman',
      keeper: 'wicket_keeper',
      wicketkeeper: 'wicket_keeper',
    },
    basketball: {
      guard: 'point_guard',
    },
  };

  const alias = aliasMap[sportKey]?.[roleKey];
  if (alias && sport[alias]) {
    return sport[alias];
  }

  // Return the first supported role in that sport as a safe fallback
  const firstRole = Object.values(sport)[0];
  return firstRole;
};
