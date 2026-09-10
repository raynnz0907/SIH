import taxonomyData from './taxonomyBenchmarks.json';

/**
 * Normalizes an attribute or role key to match taxonomy JSON keys.
 */
function normalizeKey(str) {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

/**
 * Retrieve specific role benchmarks for an athlete's sport, role, sub-role, and experience level.
 * Falls back gracefully to the sport/role default benchmarks if specific level is not found.
 *
 * @param {string} sport
 * @param {string} role
 * @param {string} [subRole]
 * @param {string} [experienceLevel='intermediate']
 * @returns {Record<string, number>} Dictionary of attribute keys to benchmark values (0-100)
 */
export function getRoleBenchmarks(sport, role, subRole = null, experienceLevel = 'intermediate') {
  const normSport = normalizeKey(sport) || 'football';
  const sportData = taxonomyData[normSport] || taxonomyData.football || {};

  if (Object.keys(sportData).length === 0) {
    return getDefaultBenchmarks();
  }

  // Resolve role
  const normRole = normalizeKey(role);
  let roleData = sportData[normRole];

  if (!roleData) {
    // Check aliases
    const aliasMap = {
      striker: 'striker',
      forward: 'striker',
      center_forward: 'striker',
      winger: 'winger',
      midfielder: 'central_midfielder',
      central_midfielder: 'central_midfielder',
      midfield: 'central_midfielder',
      defender: 'centre_back',
      centre_back: 'centre_back',
      goalkeeper: 'goalkeeper',
      batsman: 'batsman',
      batter: 'batsman',
      bowler: 'bowler',
      all_rounder: 'all_rounder',
      wicket_keeper: 'wicket_keeper',
      point_guard: 'point_guard',
      shooting_guard: 'shooting_guard',
      small_forward: 'small_forward',
      power_forward: 'power_forward',
      center: 'center',
      sprinter: 'sprinter',
      middle_distance: 'middle_distance',
      jumper: 'jumper',
      thrower: 'thrower',
    };
    const mapped = aliasMap[normRole];
    if (mapped && sportData[mapped]) {
      roleData = sportData[mapped];
    } else {
      roleData = Object.values(sportData)[0];
    }
  }

  if (!roleData) {
    return getDefaultBenchmarks();
  }

  // Resolve sub-role
  let subRoleData = null;
  if (subRole) {
    const normSub = normalizeKey(subRole);
    subRoleData = roleData[normSub];
  }
  if (!subRoleData) {
    subRoleData = Object.values(roleData)[0];
  }

  if (!subRoleData || typeof subRoleData !== 'object') {
    return getDefaultBenchmarks();
  }

  // Resolve experience level (beginner | intermediate | advanced | elite)
  const normLevel = normalizeKey(experienceLevel) || 'intermediate';
  const levelBenchmarks =
    subRoleData[normLevel] ||
    subRoleData.intermediate ||
    Object.values(subRoleData)[0] ||
    getDefaultBenchmarks();

  return {
    ...getDefaultBenchmarks(),
    ...levelBenchmarks,
  };
}

function getDefaultBenchmarks() {
  return {
    knee_stability: 70,
    explosive_capacity: 70,
    upper_body_posture: 70,
    hip_mobility: 70,
    movement_symmetry: 70,
    balance: 70,
  };
}
