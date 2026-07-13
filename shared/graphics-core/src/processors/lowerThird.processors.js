import { coalesceTrim } from '../utils.js';
import { buildMatchContext, tournamentLabelOnly, withMatchTeams } from './_shared/matchContext';
import { buildMatchSummaryInnings } from './_shared/matchSummaryInnings';
import { scoreboardBase } from './_shared/scoreboardBase';

/**
 * @param {string|null|undefined} chasingAbbrev
 * @param {number|null|undefined} runsRequired
 * @param {number|null|undefined} wicketsRemaining
 * @param {number|null|undefined} ballsRemaining
 */
function buildChaseFields(chasingAbbrev, runsRequired, wicketsRemaining, ballsRemaining) {
  const abbrev = String(chasingAbbrev ?? '').trim();
  const runs = Number(runsRequired ?? 0);
  if (!abbrev || runs <= 0) {
    return null;
  }

  return {
    chasingTeamAbbrev: abbrev,
    runsRequired: runs,
    wicketsRemaining: Number(wicketsRemaining ?? 10),
    ballsRemaining: Number(ballsRemaining ?? 0),
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processRunRate(snapshot) {
  const { live } = snapshot;
  return {
    ...scoreboardBase(snapshot),
    target: live.target,
    currentRR: live.currentRR,
    requiredRR: live.requiredRR,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processIntroLt(snapshot) {
  const mc = buildMatchContext(snapshot);
  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    matchLabel: mc.matchLabel,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processTossLt(snapshot) {
  const mc = buildMatchContext(snapshot);
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  const fromPayload = p.decision != null && String(p.decision).trim() !== '' ? String(p.decision).trim() : '';
  const { match } = snapshot;
  const side = match.tossWinnerSide;
  const choice = match.choseToBatOrBowl;
  const winnerName = side === 'home' ? mc.homeTeam.name : side === 'away' ? mc.awayTeam.name : '';

  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    decisionOverride: fromPayload || null,
    tossWinnerName: winnerName || null,
    choseToBatOrBowl: choice === 'bat' || choice === 'bowl' ? choice : null,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processResultLt(snapshot) {
  const mc = buildMatchContext(snapshot);
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  const { live, match } = snapshot;
  const payloadDetail = coalesceTrim(p.match_label, p.match_detail, p.matchDetail);
  const fromPayload = p.result_line != null && String(p.result_line).trim() !== '' ? String(p.result_line).trim() : '';
  const fromContext =
    match.resultSummary != null && String(match.resultSummary).trim() !== '' ? String(match.resultSummary).trim() : '';
  const winningTeam = p.winning_team ?? match.winningTeam ?? null;
  const resultLine = fromPayload || fromContext;

  if (match.isCompleted || resultLine) {
    return {
      homeTeam: mc.homeTeam,
      awayTeam: mc.awayTeam,
      mode: 'result',
      resultLineOverride: resultLine,
      matchDetailOverride: payloadDetail || resultLine,
      winningTeam,
    };
  }

  const chasingAbbrev = live.battingTeam?.abbrevDisplay || live.battingTeam?.shortCode || live.battingTeam?.name || '';
  const chaseFields = buildChaseFields(chasingAbbrev, live.runsToWin, live.wicketsRemaining, live.ballsRemaining);

  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    mode: 'chase',
    matchDetailOverride: payloadDetail || null,
    resultLineOverride: null,
    winningTeam,
    ...(chaseFields ?? {
      chasingTeamAbbrev: chasingAbbrev,
      runsRequired: live.runsToWin ?? 0,
      wicketsRemaining: live.wicketsRemaining ?? 0,
      ballsRemaining: live.ballsRemaining ?? 0,
    }),
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processMatchSummary(snapshot) {
  const mc = buildMatchContext(snapshot);
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});

  return {
    commandKey: snapshot.commandKey,
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    caption: coalesceTrim(p.caption, p.label) || null,
    vsLabel: coalesceTrim(p.vs_label, p.vsLabel) || null,
    innings: buildMatchSummaryInnings(snapshot, p.stats),
    tournamentLabel: tournamentLabelOnly(snapshot),
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processNeedTarget(snapshot) {
  const { live } = snapshot;
  return {
    ...scoreboardBase(snapshot),
    tournamentLabel: tournamentLabelOnly(snapshot),
    runsToWin: live.runsToWin ?? 0,
    ballsRemaining: live.ballsRemaining ?? 0,
    wicketsRemaining: live.wicketsRemaining ?? 0,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processPartnership(snapshot) {
  const { live } = snapshot;
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  return {
    ...scoreboardBase(snapshot),
    tournamentLabel: tournamentLabelOnly(snapshot),
    partnershipRuns: live.partnership.runs,
    partnershipBalls: live.partnership.balls,
    partnerships: Array.isArray(p.partnerships) && p.partnerships.length > 0 ? p.partnerships : live.partnershipHistory,
    inningsExtras: live.battingTeam?.extras ?? 0,
    inningsScore: live.battingTeam?.score ?? '',
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processPreviousOver(snapshot) {
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  return {
    ...scoreboardBase(snapshot),
    lastOverRuns: snapshot.live.previousOver.runs ?? p.last_over_runs ?? 0,
    lastOverWickets: snapshot.live.previousOver.wickets ?? p.last_over_wickets ?? 0,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processFallOfWickets(snapshot) {
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  const wickets =
    snapshot.live.fallOfWickets.length > 0 ? snapshot.live.fallOfWickets : Array.isArray(p.wickets) ? p.wickets : [];

  return withMatchTeams(snapshot, {
    ...scoreboardBase(snapshot),
    tournamentLabel: tournamentLabelOnly(snapshot),
    battingOrder: snapshot.live.battingOrder ?? [],
    wickets,
  });
}

/** @type {import('../types.js').GraphicProcessor} */
export function processWinPrediction(snapshot) {
  const wp = snapshot.live.winProbability;
  const battingSide = snapshot.live.battingTeamSide; // 'home' | 'away'

  let predictions = null;
  if (wp) {
    const battingPercent = battingSide === 'away' ? wp.away : wp.home;
    const bowlingPercent = battingSide === 'away' ? wp.home : wp.away;
    predictions = [
      { teamCode: 'batting', percent: battingPercent },
      { teamCode: 'bowling', percent: bowlingPercent },
    ];
  }

  return {
    ...scoreboardBase(snapshot),
    predictions,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processAtStage(snapshot) {
  const base = scoreboardBase(snapshot);
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  const mirror = snapshot.live.atStageMirror;

  if (mirror) {
    const { match } = snapshot;
    const rawTeam =
      mirror.battingTeam === 'away'
        ? {
            id: match.awayTeamId,
            name: match.awayTeamName,
            shortCode: match.awayTeamShortCode,
            logoUrl: match.awayTeamLogoUrl,
          }
        : {
            id: match.homeTeamId,
            name: match.homeTeamName,
            shortCode: match.homeTeamShortCode,
            logoUrl: match.homeTeamLogoUrl,
          };

    return {
      ...base,
      mirrorBattingTeam: {
        ...rawTeam,
        score: mirror.score,
        overs: mirror.overs,
      },
      mirrorBatters: mirror.batters,
      mirrorBowler: mirror.bowler,
      mirrorCurrentOverDeliveries: mirror.currentOverDeliveries ?? [],
      mirrorInningsLabel: mirror.inningsLabel,
      comparisonTeamName: '',
      comparisonScore: '',
      comparisonOvers: '',
    };
  }

  const comp = p.comparison_team ?? {};
  return {
    ...base,
    mirrorBattingTeam: null,
    mirrorBatters: [],
    mirrorBowler: { name: '', figures: '', overs: '' },
    mirrorCurrentOverDeliveries: [],
    mirrorInningsLabel: '',
    comparisonTeamName: comp.name ?? '',
    comparisonScore: comp.score ?? '',
    comparisonOvers: comp.overs ?? '',
  };
}

/**
 * @param {{ dots: number, fours: number, sixes: number, wickets: number, runs: number, deliveries?: unknown[] }} summary
 * @returns {import('../types.js').GraphicProcessor}
 */
export function createBallStripProcessor(summary) {
  return (snapshot) => ({
    ...scoreboardBase(snapshot),
    dots: summary.dots,
    fours: summary.fours,
    sixes: summary.sixes,
    wickets: summary.wickets,
    runs: summary.runs,
    deliveries: summary.deliveries ?? [],
  });
}

/** @type {import('../types.js').GraphicProcessor} */
export function processThisOver(snapshot) {
  return createBallStripProcessor(snapshot.live.thisOver)(snapshot);
}

/** @type {import('../types.js').GraphicProcessor} */
export function processLast12Balls(snapshot) {
  return createBallStripProcessor(snapshot.live.last12Balls)(snapshot);
}

/** @type {import('../types.js').GraphicProcessor} */
export function processLast30Balls(snapshot) {
  return createBallStripProcessor(snapshot.live.last30Balls)(snapshot);
}
