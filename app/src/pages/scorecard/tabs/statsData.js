/**
 * Mock season stats per tournament - replace with API later.
 * Kept in sync with tournamentId so Stats tab stays dynamic with other tabs.
 */

const DEFAULT_STATS = {
  totalFours: 476,
  totalSixes: 265,
  topRunScorers: [
    {
      id: '1',
      name: 'Arsalan Butt',
      teamAbbr: 'KK',
      role: 'RHB',
      runs: 154,
      innings: 2,
      average: 154.0,
      image: null,
    },
    {
      id: '2',
      name: 'Arsalan Butt',
      teamAbbr: 'KK',
      role: 'RHB',
      runs: 154,
      innings: 2,
      average: 154.0,
      image: null,
    },
    {
      id: '3',
      name: 'Arsalan Butt',
      teamAbbr: 'KK',
      role: 'RHB',
      runs: 154,
      innings: 2,
      average: 154.0,
      image: null,
    },
  ],
  topWicketTakers: [
    {
      id: '1',
      name: 'Arsalan Butt',
      teamAbbr: 'KK',
      role: 'RHB',
      wickets: 6,
      innings: 2,
      average: 154.0,
      image: null,
    },
    {
      id: '2',
      name: 'Arsalan Butt',
      teamAbbr: 'KK',
      role: 'RHB',
      wickets: 6,
      innings: 2,
      average: 154.0,
      image: null,
    },
    {
      id: '3',
      name: 'Arsalan Butt',
      teamAbbr: 'KK',
      role: 'RHB',
      wickets: 6,
      innings: 2,
      average: 154.0,
      image: null,
    },
  ],
};

/** Season stats by league/tournamentId - use same keys as mockMatches.league */
export const STATS_BY_TOURNAMENT = {
  KTPL: { ...DEFAULT_STATS },
  DMT: {
    totalFours: 312,
    totalSixes: 189,
    topRunScorers: DEFAULT_STATS.topRunScorers,
    topWicketTakers: DEFAULT_STATS.topWicketTakers,
  },
  TSL: {
    totalFours: 401,
    totalSixes: 220,
    topRunScorers: DEFAULT_STATS.topRunScorers,
    topWicketTakers: DEFAULT_STATS.topWicketTakers,
  },
  DPL: {
    totalFours: 288,
    totalSixes: 165,
    topRunScorers: DEFAULT_STATS.topRunScorers,
    topWicketTakers: DEFAULT_STATS.topWicketTakers,
  },
  XRL: {
    totalFours: 198,
    totalSixes: 98,
    topRunScorers: DEFAULT_STATS.topRunScorers,
    topWicketTakers: DEFAULT_STATS.topWicketTakers,
  },
};

/** Default player list for Most Fours / Most Sixes tables (rank, playerName, mat, inns) */
const DEFAULT_MOST_FOURS = [
  { rank: 1, playerName: 'Arslan Butt', mat: 2, inns: 2 },
  { rank: 2, playerName: 'Rahmanullah Gurbaz', mat: 2, inns: 2 },
  { rank: 3, playerName: 'Ishan Kishan', mat: 2, inns: 2 },
  { rank: 4, playerName: 'Sahibzada Farhan', mat: 2, inns: 2 },
  { rank: 5, playerName: 'Sohaib Khan', mat: 2, inns: 2 },
];

const DEFAULT_MOST_SIXES = [
  { rank: 1, playerName: 'Arslan Butt', mat: 2, inns: 2 },
  { rank: 2, playerName: 'Rahmanullah Gurbaz', mat: 2, inns: 2 },
  { rank: 3, playerName: 'Ishan Kishan', mat: 2, inns: 2 },
  { rank: 4, playerName: 'Sahibzada Farhan', mat: 2, inns: 2 },
  { rank: 5, playerName: 'Sohaib Khan', mat: 2, inns: 2 },
];

/** Most fours/sixes by tournament - keyed by tournamentId for dynamic StatsTotal */
export const MOST_FOURS_BY_TOURNAMENT = {
  KTPL: DEFAULT_MOST_FOURS,
  DMT: DEFAULT_MOST_FOURS,
  TSL: DEFAULT_MOST_FOURS,
  DPL: DEFAULT_MOST_FOURS,
  XRL: DEFAULT_MOST_FOURS,
};

export const MOST_SIXES_BY_TOURNAMENT = {
  KTPL: DEFAULT_MOST_SIXES,
  DMT: DEFAULT_MOST_SIXES,
  TSL: DEFAULT_MOST_SIXES,
  DPL: DEFAULT_MOST_SIXES,
  XRL: DEFAULT_MOST_SIXES,
};

/**
 * Get season stats for a tournament. Falls back to default when league not in map.
 * @param {string} [tournamentId]
 * @returns {typeof DEFAULT_STATS}
 */
export function getSeasonStats(tournamentId) {
  if (!tournamentId) return DEFAULT_STATS;
  return STATS_BY_TOURNAMENT[tournamentId] ?? DEFAULT_STATS;
}

/**
 * Get table rows for StatsTotal page (fours, sixes, run-scorers, or wicket-takers).
 * @param {string} [tournamentId]
 * @param {'fours'|'sixes'|'run-scorers'|'wicket-takers'} statType
 */
export function getStatsTotalRows(tournamentId, statType) {
  if (statType === 'run-scorers' || statType === 'wicket-takers') {
    const stats = getSeasonStats(tournamentId);
    const list =
      statType === 'run-scorers' ? stats.topRunScorers : stats.topWicketTakers;
    return list.map((p, i) => ({
      rank: i + 1,
      playerName: p.name,
      mat: p.innings ?? 2,
      inns: p.innings ?? 2,
    }));
  }
  const source =
    statType === 'sixes' ? MOST_SIXES_BY_TOURNAMENT : MOST_FOURS_BY_TOURNAMENT;
  if (!tournamentId)
    return statType === 'sixes' ? DEFAULT_MOST_SIXES : DEFAULT_MOST_FOURS;
  return (
    source[tournamentId] ??
    (statType === 'sixes' ? DEFAULT_MOST_SIXES : DEFAULT_MOST_FOURS)
  );
}
