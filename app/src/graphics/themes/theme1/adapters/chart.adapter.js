/**
 * Chart processors → Tapeya chart graphic data shapes.
 */
import { SHOT_ZONE_GEOMETRY } from '@/lib/utils/shotAreaUtils';

import { tournamentSub } from './_shared';
import { chartLabelsForCommand } from './presentationLabels';
import { toTeams } from './teams.adapter';

/**
 * @param {number} yMax
 */
function buildYTicks(yMax) {
  const step = yMax <= 50 ? 10 : yMax <= 100 ? 25 : Math.ceil(yMax / 4 / 10) * 10;
  const ticks = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== yMax) ticks.push(yMax);
  return ticks;
}

/**
 * @param {string} colorToken
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
function accentForColorToken(colorToken, tokens) {
  if (colorToken === 'away') return tokens?.awayBgColor || 'var(--accentB)';
  return tokens?.homeBgColor || 'var(--accentA)';
}

/**
 * Map innings-ordered processor teams to top/bottom chart pair.
 *
 * @param {Array<{ displayName?: string, colorToken?: string, logoUrl?: string|null }>|undefined} inningsTeams
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {Record<string, unknown>} homeTeam
 * @param {Record<string, unknown>} awayTeam
 * @param {Record<string, object>|null} theme1Teams
 */
function chartTeamPairFromInnings(inningsTeams, tokens, homeTeam, awayTeam, theme1Teams) {
  const fixturePair = chartTeamPair(homeTeam, awayTeam, theme1Teams);
  const entries = Array.isArray(inningsTeams) ? inningsTeams : [];

  const mapEntry = (entry, index) => {
    const fallback = index === 0 ? fixturePair.top : fixturePair.bottom;
    if (entry?.displayName) {
      return {
        name: entry.displayName,
        shortName: fallback.shortName ?? entry.displayName,
        accent: accentForColorToken(entry.colorToken ?? 'home', tokens),
        logoUrl: entry.logoUrl ?? fallback.logoUrl ?? null,
      };
    }

    return fallback;
  };

  return {
    top: mapEntry(entries[0], 0),
    bottom: mapEntry(entries[1], 1),
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
function resolveChartTeamPair(props, tokens) {
  const theme1Teams = toTeams(props, tokens);
  return chartTeamPairFromInnings(props.teams, tokens, props.homeTeam, props.awayTeam, theme1Teams);
}

/**
 * @param {Record<string, unknown>} homeTeam
 * @param {Record<string, unknown>} awayTeam
 * @param {Record<string, object>} teams
 */
function chartTeamPair(homeTeam, awayTeam, teams) {
  const top = teams?.home ?? {
    name: homeTeam?.name ?? '',
    accent: 'var(--accentA)',
    logoUrl: homeTeam?.logoUrl ?? null,
    shortName: homeTeam?.shortCode ?? homeTeam?.name ?? '',
  };
  const bottom = teams?.away ?? {
    name: awayTeam?.name ?? '',
    accent: 'var(--accentB)',
    logoUrl: awayTeam?.logoUrl ?? null,
    shortName: awayTeam?.shortCode ?? awayTeam?.name ?? '',
  };

  return {
    top: {
      name: top.fullName ?? top.displayName ?? top.name,
      shortName: top.code ?? top.shortName ?? top.name,
      accent: top.color ?? top.accent,
      logoUrl: top.logoUrl ?? null,
    },
    bottom: {
      name: bottom.fullName ?? bottom.displayName ?? bottom.name,
      shortName: bottom.code ?? bottom.shortName ?? bottom.name,
      accent: bottom.color ?? bottom.accent,
      logoUrl: bottom.logoUrl ?? null,
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toWormChartData(props, tokens) {
  const chartSeries = Array.isArray(props.chartSeries) ? props.chartSeries : [];
  if (!chartSeries.length) return null;

  const teamPair = resolveChartTeamPair(props, tokens);
  const overCategories = Array.isArray(props.overCategories) ? props.overCategories : [];
  const xMax = overCategories.length || Math.max(...chartSeries.map((s) => s.data?.length ?? 0));
  const yMax = props.yAxisMax ?? 100;
  // Keep null for overs not yet bowled — the layout skips them so shorter-innings
  // lines end at the correct over rather than dropping back to zero.
  const topSeries = chartSeries[0]?.data ?? [];
  const bottomSeries = chartSeries[1]?.data ?? [];
  const summaryCards = Array.isArray(props.summaryCards) ? props.summaryCards : [];

  const labels = chartLabelsForCommand(props.commandKey, {
    title: props.chartTitle,
    yLabel: props.yAxisLabel,
  });

  return {
    title: labels.title,
    sub: tournamentSub(props),
    teams: teamPair,
    chart: {
      yMax,
      yTicks: buildYTicks(yMax),
      xMax,
      topSeries,
      bottomSeries,
      yLabel: labels.yLabel,
      markerOver: xMax > 0 ? xMax : null,
      markerPointIndices: [],
    },
    meta: {
      top: summaryCards[0]
        ? {
            total: summaryCards[0].score ?? '',
            overs: summaryCards[0].overs ?? '',
            fours: summaryCards[0].four ?? 0,
            sixes: summaryCards[0].six ?? 0,
          }
        : {},
      bottom: summaryCards[1]
        ? {
            total: summaryCards[1].score ?? '',
            overs: summaryCards[1].overs ?? '',
            fours: summaryCards[1].four ?? 0,
            sixes: summaryCards[1].six ?? 0,
          }
        : {},
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toPhaseChartData(props, tokens) {
  const phaseCategories = Array.isArray(props.phaseCategories) ? props.phaseCategories : [];
  const chartSeries = Array.isArray(props.chartSeries) ? props.chartSeries : [];
  if (!phaseCategories.length || !chartSeries.length) return null;

  const teamPair = resolveChartTeamPair(props, tokens);
  const yMax = props.yAxisMax ?? 100;
  const wicketBadges = Array.isArray(props.wicketBadges) ? props.wicketBadges : [];
  const summaryCards = Array.isArray(props.summaryCards) ? props.summaryCards : [];

  const buckets = phaseCategories.map((label, index) => ({
    label,
    top: chartSeries[0]?.data?.[index] ?? 0,
    bottom: chartSeries[1]?.data?.[index] ?? 0,
  }));

  const topWicketBadges = (wicketBadges[0] ?? [])
    .map((v, i) => (v != null && v > 0 ? { bucketIndex: i, value: v } : null))
    .filter(Boolean);

  const labels = chartLabelsForCommand(props.commandKey, {
    title: props.chartTitle,
    yLabel: props.yAxisLabel,
  });

  return {
    title: labels.title,
    sub: tournamentSub(props),
    teams: teamPair,
    chart: {
      yMax,
      yTicks: buildYTicks(yMax),
      yLabel: labels.yLabel,
      xLabel: 'OVERS',
      buckets,
      topWicketBadges: topWicketBadges.length > 0 ? topWicketBadges : undefined,
    },
    summary: {
      top: {
        name: summaryCards[0]?.team ?? teamPair.top.shortName ?? teamPair.top.name,
        score: summaryCards[0]?.score ?? '',
      },
      bottom: {
        name: summaryCards[1]?.team ?? teamPair.bottom.shortName ?? teamPair.bottom.name,
        score: summaryCards[1]?.score ?? '',
      },
    },
  };
}

/**
 * @param {Record<string, unknown>} ball
 */
function ballToShot(ball) {
  const dir = ball.shotDirection ?? ball.shot_direction;
  const geom = dir ? SHOT_ZONE_GEOMETRY[dir] : null;
  const angleDeg = geom?.position?.angleDeg ?? 0;
  const runs = ball.runs ?? 0;
  return {
    angle: angleDeg - 90,
    dist: Math.min(0.35 + runs * 0.1, 1),
    runs,
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {{ player?: Record<string, unknown> }} [options]
 */
export function toWagonWheelData(props, tokens, options = {}) {
  const ballHistory = Array.isArray(props.ballHistory) ? props.ballHistory : [];
  if (!ballHistory.length) return null;

  const teams = toTeams(props, tokens);
  const teamPair = chartTeamPair(props.homeTeam, props.awayTeam, teams);
  const player = options.player ?? props.player ?? props;
  const playerName = player.playerName ?? player.name ?? player.display_name ?? '';
  const teamName = player.teamName ?? props.battingTeam?.name ?? teamPair.bottom.name;

  return {
    title: options.title ?? 'WAGON WHEEL',
    sub: tournamentSub(props),
    teams: teamPair,
    player: {
      name: playerName,
      role: player.playerRole ?? player.role ?? '',
      teamName,
    },
    shots: ballHistory.map(ballToShot),
  };
}
