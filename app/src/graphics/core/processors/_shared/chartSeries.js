/**
 * Per-innings team metadata for chart crests and colors (innings order).
 *
 * @param {Array<Record<string, unknown>>} inningsChart
 */
export function buildInningsTeams(inningsChart) {
  if (!inningsChart?.length) return [];

  return inningsChart.map((inn) => ({
    displayName: inn.team_name ?? '',
    colorToken: inn.color_token ?? inn.batting_team ?? 'home',
    logoUrl: inn.logo_url ?? null,
  }));
}

/**
 * Build chart-ready data from normalized innings chart entries (per-over worm view).
 *
 * @param {Array<Record<string, unknown>>} inningsChart
 * @param {'cumulative'|'runs'|'run_rate'} mode
 */
export function buildChartSeries(inningsChart, mode) {
  if (!inningsChart || inningsChart.length === 0) {
    return {
      teams: [],
      chartSeries: [],
      summaryCards: [],
      overCategories: [],
      yAxisMax: 100,
    };
  }

  const maxOvers = Math.max(...inningsChart.map((inn) => inn.overs_breakdown?.length ?? 0));
  const overCategories = Array.from({ length: maxOvers }, (_, i) => String(i + 1).padStart(2, '0'));

  const chartSeries = inningsChart.map((inn) => {
    const breakdown = inn.overs_breakdown ?? [];
    const data = Array.from({ length: maxOvers }, (_, i) => {
      const over = breakdown[i];
      if (!over) return null;
      switch (mode) {
        case 'cumulative':
          return over.cumulative;
        case 'run_rate':
          return over.run_rate ?? 0;
        case 'runs':
          return over.runs;
        default:
          return over.runs;
      }
    });
    return { name: inn.team_name ?? `Innings ${inn.innings_number}`, data };
  });

  const allValues = chartSeries.flatMap((s) => s.data.filter((v) => v !== null));
  const yAxisMax = allValues.length > 0 ? Math.ceil(Math.max(...allValues) * 1.15) : 100;

  const summaryCards = buildSummaryCards(inningsChart);
  const teams = buildInningsTeams(inningsChart);

  return { teams, chartSeries, summaryCards, overCategories, yAxisMax };
}

/**
 * Phase-bucket chart props for Manhattan / Run Rate (runs-in-phase bars).
 *
 * @param {Array<Record<string, unknown>>} inningsChart
 * @param {{ showWicketBadges?: boolean }} options
 */
export function buildPhaseChartProps(inningsChart, options = {}) {
  const { showWicketBadges = false } = options;

  if (!inningsChart || inningsChart.length === 0) {
    return {
      teams: [],
      chartSeries: [],
      phaseCategories: [],
      wicketBadges: [],
      summaryCards: [],
      yAxisMax: 100,
    };
  }

  const phaseSource = inningsChart[0]?.phase_stats ?? inningsChart[0]?.over_buckets ?? [];
  const phaseCategories = phaseSource.map((bucket) => bucket.over_range ?? bucket.label ?? '');

  const baseTeams = buildInningsTeams(inningsChart);

  const teams = inningsChart.map((inn, index) => {
    const buckets = inn.phase_stats ?? inn.over_buckets ?? [];
    const phaseStats = buckets.map((bucket) => ({
      overRange: bucket.over_range ?? bucket.label ?? '',
      runs: bucket.runs ?? 0,
      wicketsInPhase: bucket.wickets_in_phase ?? 0,
    }));
    const base = baseTeams[index] ?? { displayName: '', colorToken: 'home', logoUrl: null };

    return {
      ...base,
      inningsSummary: {
        runs: inn.total_runs ?? 0,
        wickets: inn.total_wickets ?? 0,
      },
      phaseStats,
    };
  });

  const chartSeries = teams.map((team) => ({
    name: team.displayName,
    data: team.phaseStats.map((phase) => phase.runs),
    colorToken: team.colorToken ?? 'home',
  }));

  const wicketBadges = showWicketBadges
    ? teams.map((team) => team.phaseStats.map((phase) => (phase.wicketsInPhase > 0 ? phase.wicketsInPhase : null)))
    : [];

  const allValues = chartSeries.flatMap((s) => s.data.filter((v) => v !== null && v !== undefined));
  const yAxisMax = allValues.length > 0 ? Math.ceil(Math.max(...allValues) * 1.15) : 100;

  return {
    teams,
    chartSeries,
    phaseCategories,
    wicketBadges,
    summaryCards: buildSummaryCards(inningsChart),
    yAxisMax,
  };
}

/** @param {Array<Record<string, unknown>>} inningsChart */
function buildSummaryCards(inningsChart) {
  return inningsChart.map((inn) => ({
    team: inn.team_name ?? '',
    score: `${inn.total_runs}/${inn.total_wickets}`,
    overs: inn.display_overs ?? '',
    six: inn.sixes ?? 0,
    four: inn.fours ?? 0,
  }));
}
