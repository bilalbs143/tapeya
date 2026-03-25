export function getProfileRankingParamsByPlayingRole(playingRoleEnum) {
  const raw = playingRoleEnum == null ? '' : String(playingRoleEnum);
  const key = raw.includes('_') ? raw.toLowerCase() : raw.toUpperCase();

  if (key === 'BOWLER' || key === 'bowler') {
    return {
      category: 'bowling',
      sort: 'wickets',
    };
  }

  if (key === 'ALL_ROUNDER' || key === 'all_rounder') {
    return {
      category: 'batting',
      sort: 'runs',
    };
  }

  /* BATSMAN, unknown, or unset — batting runs */
  return {
    category: 'batting',
    sort: 'runs',
  };
}
