import { buildMatchCtx, coalesceTrim } from './graphicPropsHelpers';

function buildTournamentOverviewProps(ctx, p, defaultMatchLabel) {
  const mc = buildMatchCtx(ctx);
  const matchNumber =
    ctx.match?.number != null && String(ctx.match.number).trim() !== '' ? `Match ${String(ctx.match.number).trim()}` : '';
  return {
    tournamentName: coalesceTrim(p.tournament_name, mc.tournamentName),
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
    matchLabel: coalesceTrim(p.match_label, p.subtitle, p.label, defaultMatchLabel, mc.tournamentShort, matchNumber),
  };
}

/**
 * Build chart-ready data from the `innings_chart` context array.
 *
 * @param {Array} inningsChart ctx.innings_chart from session context
 * @param {'cumulative'|'runs'|'run_rate'} mode
 */
function buildChartData(inningsChart, mode) {
  if (!inningsChart || inningsChart.length === 0) {
    return {
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

  const summaryCards = inningsChart.map((inn) => ({
    team: inn.team_name ?? '',
    score: `${inn.total_runs}/${inn.total_wickets}`,
    overs: inn.display_overs ?? '',
    six: inn.sixes ?? 0,
    four: inn.fours ?? 0,
  }));

  return { chartSeries, summaryCards, overCategories, yAxisMax };
}

/**
 * Match chrome, playing XI, tournament panels, and chart graphics.
 *
 * @param {string|null} commandKey
 * @param {Record<string, unknown>} ctx
 * @param {Record<string, unknown>} p
 * @returns {Record<string, unknown>|undefined}
 */
export function buildFullScreenGraphicProps(commandKey, ctx, p) {
  switch (commandKey) {
    case 'THIS_MATCH':
    case 'MATCH_INFO':
    case 'SCORECARD_FULL':
    case 'NEXT_MATCH': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        matchNumber: mc.matchNumber,
        venue: mc.venue,
        tournamentName: mc.tournamentName,
      };
    }

    case 'TOURNAMENT_NAME':
      return buildTournamentOverviewProps(ctx, p, '');

    case 'SELECT_DRAW':
      return buildTournamentOverviewProps(ctx, p, 'Select Draw');

    case 'POINT_TABLE':
      return buildTournamentOverviewProps(ctx, p, 'Points Table');

    case 'MATCH_SUMMARY_FS': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: {
          ...mc.homeTeam,
          score: p.home_score ?? ctx.score ?? '',
          overs: p.home_overs ?? ctx.overs ?? '',
        },
        awayTeam: {
          ...mc.awayTeam,
          score: p.away_score ?? '',
          overs: p.away_overs ?? '',
        },
      };
    }

    case 'PLAYING_11':
    case 'PLAYING_ELEVEN_HOME':
    case 'PLAYING_ELEVEN_AWAY': {
      const mc = buildMatchCtx(ctx);
      const side = { PLAYING_ELEVEN_HOME: 'home', PLAYING_ELEVEN_AWAY: 'away' }[commandKey] ?? 'both';
      return {
        homeTeam: { ...mc.homeTeam, players: p.home_team?.players ?? [] },
        awayTeam: { ...mc.awayTeam, players: p.away_team?.players ?? [] },
        matchLabel: mc.matchLabel,
        side,
      };
    }

    case 'WORM': {
      const mc = buildMatchCtx(ctx);
      const inningsChart = Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [];
      const { chartSeries, summaryCards, overCategories, yAxisMax } = buildChartData(inningsChart, 'cumulative');
      return {
        chartSeries,
        summaryCards,
        overCategories,
        yAxisMax,
        matchLabel: mc.matchLabel,
        chartTitle: 'Worm',
        yAxisLabel: 'Runs',
      };
    }

    case 'RUN_RATE_CHART': {
      const mc = buildMatchCtx(ctx);
      const inningsChart = Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [];
      const { chartSeries, summaryCards, overCategories, yAxisMax } = buildChartData(inningsChart, 'run_rate');
      return {
        chartSeries,
        summaryCards,
        overCategories,
        yAxisMax,
        matchLabel: mc.matchLabel,
        chartTitle: 'Run Rate',
        yAxisLabel: 'RPO',
      };
    }

    case 'MANHATTAN': {
      const mc = buildMatchCtx(ctx);
      const inningsChart = Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [];
      const { chartSeries, summaryCards, overCategories, yAxisMax } = buildChartData(inningsChart, 'runs');
      return {
        chartSeries,
        summaryCards,
        overCategories,
        yAxisMax,
        matchLabel: mc.matchLabel,
        chartTitle: 'Manhattan',
        yAxisLabel: 'Runs',
      };
    }

    default:
      return undefined;
  }
}
