/**
 * Scoreboard processors → Tapeya ControllerBar frame/teams/match bundle.
 *
 * Processor base (scoreboardBase): battingTeam, bowlingTeam, batters, bowler,
 * currentOverDeliveries, extras
 */
import { parseInningsScore, toFrameBatter, toFrameBowler } from './_shared';
import { ballStripLabelForCommand, tourStatTitleForCommand } from './presentationLabels';
import { toMatch, toTeams } from './teams.adapter';

function deliveryToken(d) {
  return String(d.displayToken ?? d.display_token ?? '');
}

function mapDeliveriesToChips(deliveries) {
  if (!Array.isArray(deliveries) || deliveries.length === 0) return [];
  return deliveries.map((d) => ({
    code: deliveryToken(d),
    chipType: d.chip_type ?? d.chipType ?? null,
  }));
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {{
 *   barVariant?: string,
 *   mini?: Record<string, unknown>|null,
 *   event?: Record<string, unknown>|null,
 * }} [options]
 */
export function toScoreBarBundle(props, tokens, options = {}) {
  const teams = toTeams(props, tokens);
  if (!teams) return null;

  const match = toMatch(props, tokens, teams);
  if (!match) return null;

  const batting = props.battingTeam ?? {};
  const batters = Array.isArray(props.batters) ? props.batters : [];
  const striker = batters.find((b) => b.onStrike) ?? batters[0] ?? {};
  const nonStriker = batters.find((b) => !b.onStrike && b !== striker) ?? batters[1] ?? {};

  const parsedScore = parseInningsScore(batting.score, batting.wickets ?? batting.wkts);
  if (!parsedScore) return null;
  const { total, wkts, scoreSep } = parsedScore;

  const overs = batting.overs ?? '';
  const oversLimit =
    batting.oversLimit ??
    batting.overs_limit ??
    batting.maxOvers ??
    batting.max_overs ??
    props.maxOversPerInnings ??
    props.max_overs_per_innings ??
    null;
  const ballsLabel = ballStripLabelForCommand(props.commandKey, props.ballsLabel ?? null);

  const currentOverDeliveries = Array.isArray(props.currentOverDeliveries) ? props.currentOverDeliveries : [];
  const thisOverChips = currentOverDeliveries.map((d) => ({
    code: deliveryToken(d),
    chipType: d.chip_type ?? d.chipType ?? null,
  }));

  const frame = {
    total,
    wkts,
    scoreSep: scoreSep === '/' ? '-' : scoreSep,
    oversText: overs ? String(overs) : '',
    oversLimit: oversLimit != null && oversLimit !== '' ? String(oversLimit) : null,
    rr: props.currentRR || '',
    rrLabel: 'CRR',
    rrr: props.requiredRR || null,
    rrrLabel: 'RRR',
    striker: toFrameBatter(striker, tokens),
    nonStriker: toFrameBatter(nonStriker, tokens),
    bowler: toFrameBowler(props.bowler, tokens),
    thisOver: thisOverChips.map((c) => c.code),
    thisOverChips,
    event: options.event ?? props.event ?? null,
    mini: options.mini ?? props.mini ?? null,
    barVariant: options.barVariant ?? props.barVariant ?? 'default',
    target: props.target,
    runsToWin: props.runsToWin,
    ballsRemaining: props.ballsRemaining,
    wicketsRemaining: props.wicketsRemaining,
    partnershipRuns: props.partnershipRuns,
    partnershipBalls: props.partnershipBalls,
    partnership: props.partnershipRuns != null ? { runs: props.partnershipRuns, balls: props.partnershipBalls ?? 0 } : null,
    projectedScore: props.projectedScore ?? null,
    lastOverRuns: props.lastOverRuns,
    lastOverWickets: props.lastOverWickets ?? 0,
    winProbHome: props.winProbHome,
    winProbAway: props.winProbAway,
    deliveries: props.deliveries,
    ballsLabel,
    dots: props.dots,
    fours: props.fours,
    sixes: props.sixes,
    wickets: props.wickets,
    runs: props.runs,
    last30Stats:
      props.dots != null
        ? { dots: props.dots, fours: props.fours, sixes: props.sixes, wickets: props.wickets, runs: props.runs }
        : null,
    last12Chips: mapDeliveriesToChips(props.deliveries),
    last12Label: ballsLabel ? String(ballsLabel).toUpperCase() : undefined,
    last12Runs: props.runs,
    predictions: props.predictions ?? null,
  };

  // At Stage — 2nd innings only; compare 1st innings score at this same over/ball
  if (props.mirrorBattingTeam != null) {
    const mirrorScore = parseInningsScore(props.mirrorBattingTeam.score) ?? { total: 0, wkts: 0, scoreSep: '-' };
    const bowlingTeam = teams[match.bowlingCode];
    const battingTeam = teams[match.battingCode];
    frame.stageComparison = [
      { label: bowlingTeam?.code ?? '1ST INN', ...mirrorScore },
      { label: battingTeam?.code ?? 'NOW', total, wkts, scoreSep },
    ];
    frame.stageLabel = 'AT THIS STAGE';
  }

  if (!frame.striker.name && !frame.nonStriker.name && total === 0 && !overs) {
    return null;
  }

  return { frame, teams, match };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toTourHitBundle(props, tokens) {
  const title = tourStatTitleForCommand(props.commandKey);
  const tourHit = props.tourHit ?? {};
  const mini = {
    label: 'TOURNAMENT',
    title: String(title).replace(/^TOURNAMENT\s+/i, ''),
    count: tourHit.value ?? 0,
    logoUrl: tourHit.tournamentLogoUrl ?? null,
    shortCode: tourHit.tournamentShortCode ?? '',
  };

  const barVariantByTitle = {
    RUNS: 'runs',
    FOURS: 'fours',
    SIXES: 'sixes',
    FIFTIES: 'fifties',
    HUNDREDS: 'hundreds',
    WICKETS: 'wickets',
  };

  const key = String(mini.title ?? title).toUpperCase();
  return toScoreBarBundle(props, tokens, {
    mini,
    barVariant: barVariantByTitle[key] ?? 'default',
  });
}
