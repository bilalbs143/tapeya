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

/** Default player list for Most Fours / Most Sixes tables (full row shape) */
const DEFAULT_ROW = {
  mat: 2,
  inns: 2,
  balls: 96,
  hs: 89,
  avg: '77.50',
  sr: '142.50',
  six: 4,
  four: 12,
  '50s': 1,
  '100s': 0,
};

const DEFAULT_MOST_FOURS = [
  { rank: 1, playerName: 'Arslan Butt', ...DEFAULT_ROW },
  { rank: 2, playerName: 'Rahmanullah Gurbaz', ...DEFAULT_ROW },
  { rank: 3, playerName: 'Ishan Kishan', ...DEFAULT_ROW },
  { rank: 4, playerName: 'Sahibzada Farhan', ...DEFAULT_ROW },
  { rank: 5, playerName: 'Sohaib Khan', ...DEFAULT_ROW },
];

const DEFAULT_MOST_SIXES = [
  { rank: 1, playerName: 'Arslan Butt', ...DEFAULT_ROW },
  { rank: 2, playerName: 'Rahmanullah Gurbaz', ...DEFAULT_ROW },
  { rank: 3, playerName: 'Ishan Kishan', ...DEFAULT_ROW },
  { rank: 4, playerName: 'Sahibzada Farhan', ...DEFAULT_ROW },
  { rank: 5, playerName: 'Sohaib Khan', ...DEFAULT_ROW },
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
 * Row shape depends on statType; only fields for that view are set.
 * @param {string} [tournamentId]
 * @param {'fours'|'sixes'|'run-scorers'|'wicket-takers'} statType
 */
export function getStatsTotalRows(tournamentId, statType) {
  if (statType === 'run-scorers') {
    const stats = getSeasonStats(tournamentId);
    return stats.topRunScorers.map((p, i) => ({
      rank: i + 1,
      playerName: p.name,
      mat: p.innings ?? 2,
      runs: p.runs ?? 154,
      inns: p.innings ?? 2,
      balls: 96,
      hs: 89,
      avg: (p.average ?? 154).toFixed(2),
      sr: '142.50',
      six: 4,
      four: 12,
      '50s': 1,
      '100s': 0,
    }));
  }
  if (statType === 'wicket-takers') {
    const stats = getSeasonStats(tournamentId);
    return stats.topWicketTakers.map((p, i) => ({
      rank: i + 1,
      playerName: p.name,
      mat: p.innings ?? 2,
      wkts: p.wickets ?? 6,
      balls: 120,
      overs: 20,
      mdns: 1,
      runs: 98,
      inns: p.innings ?? 2,
      bbi: '3/24',
      ave: '16.33',
      econ: '4.90',
      sr: '20.00',
      '4': 0,
      '5': 1,
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
