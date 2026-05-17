/**
 * scoringUtils.js
 *
 * Shared scoring helpers — pure functions, no React.
 * Used by: ScoringMatch, ScoringTab, PartnershipTab, StartMatch, ScorecardTab.
 */

import { isLegalDelivery } from './cricketRules';

// ─── Date / time formatting ───────────────────────────────────────────────────

/**
 * Format date for API (YYYY-MM-DD).
 * Accepts YYYY-MM-DD, MM-DD-YYYY, or Date objects.
 */
export function formatDateForApi(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const mmdd = (value ?? '').match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mmdd) {
    const [, mm, dd, yyyy] = mmdd;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  try {
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

/**
 * Format time for API (HH:mm). Normalises single-digit minutes ("2:5" → "2:05").
 */
export function formatTimeForApi(value) {
  if (!value) return '';
  const v = (value ?? '').trim();
  const normalised = v.replace(/^(\d{1,2}):(\d)$/, '$1:0$2');
  if (/^\d{1,2}:\d{2}$/.test(normalised)) {
    return normalised.length === 4 ? `0${normalised}` : normalised;
  }
  return '';
}

// ─── Ball type normalisation ──────────────────────────────────────────────────

/**
 * Normalise a ball to ensure it has a `type` field.
 * Handles both UI shape (has .type) and API shape (has is_wicket, is_wide, etc.).
 */
function normaliseBallType(ball) {
  if (!ball) return null;
  if (ball.type) return ball;
  if (ball.is_wicket) return { ...ball, type: 'out' };
  if (ball.is_wide) return { ...ball, type: 'wd' };
  if (ball.is_no_ball) return { ...ball, type: 'nb' };
  if (ball.is_bye) return { ...ball, type: 'bye' };
  if (ball.is_leg_bye) return { ...ball, type: 'lb' };
  const pr = Number(ball.penalty_runs ?? ball.penaltyRuns ?? 0) || 0;
  if (pr > 0 && !ball.is_wicket && Number(ball.runs ?? 0) === 0) {
    return { ...ball, type: 'penalty', penaltyRuns: pr, runs: 0 };
  }
  return { ...ball, type: 'runs' };
}

// ─── Pre-ball crease (PATCH /matches/:id/crease) ─────────────────────────────

/**
 * Build the API patch for pending openers / bowler before the first ball.
 * Striker is always `batsmenOnCrease[strikerIndex]`; non-striker is the other slot.
 *
 * @returns {{ next_batter_id?: number, next_non_striker_id?: number, next_bowler_id?: number }}
 */
export function buildPreBallCreasePatch({
  batsmenOnCrease = [],
  bowlersInTable = [],
  strikerIndex = 0,
  currentBowlerIndex = 0,
} = {}) {
  const si = Math.min(Math.max(0, Number(strikerIndex) || 0), Math.max(0, batsmenOnCrease.length - 1));
  const striker = batsmenOnCrease[si];
  const nonStriker = batsmenOnCrease.length >= 2 ? batsmenOnCrease[1 - si] : null;

  const bi = Math.min(Math.max(0, Number(currentBowlerIndex) || 0), Math.max(0, bowlersInTable.length - 1));
  const bowler = bowlersInTable[bi];

  /** @type {{ next_batter_id?: number, next_non_striker_id?: number, next_bowler_id?: number }} */
  const patch = {};

  if (striker?.id != null && striker.id !== '') {
    patch.next_batter_id = Number(striker.id);
  }
  if (nonStriker?.id != null && nonStriker.id !== '') {
    patch.next_non_striker_id = Number(nonStriker.id);
  }
  if (bowler?.id != null && bowler.id !== '') {
    patch.next_bowler_id = Number(bowler.id);
  }

  return patch;
}

// ─── Per-ball run extraction ──────────────────────────────────────────────────

/**
 * Total runs contributed by a single ball (batting runs + extras + penalty).
 */
export function getRunsFromBall(ball) {
  const b = normaliseBallType(ball);
  if (!b) return 0;
  // 'out' and 'retired_hurt' contribute 0 batting runs (runs field may be absent).
  if (b.type === 'out' || b.type === 'retired_hurt') return 0;
  const pr = Number(b.penaltyRuns ?? b.penalty_runs ?? 0) || 0;
  return (b.runs ?? 0) + pr;
}

// ─── Extra-ball display label ─────────────────────────────────────────────────

/**
 * Returns the chip label for an extra delivery in international format:
 *
 *   WD        → 'WD'   (1 wide penalty, no additional run)
 *   1WD       → '1WD'  (1 extra run + 1 wide penalty = 2 total)
 *   NB        → 'NB'   (1 no-ball penalty, 0 off bat)
 *   1NB       → '1NB'  (1 off bat  + 1 NB penalty  = 2 total)
 *   2NB       → '2NB'  (2 off bat  + 1 NB penalty  = 3 total)
 *   B         → 'B'    (1 bye)
 *   2B        → '2B'   (2 byes)
 *   LB        → 'LB'   (1 leg bye)
 *   2LB       → '2LB'  (2 leg byes)
 *
 * @param {'wd'|'nb'|'bye'|'lb'} type
 * @param {number} runs  total runs as stored (WD/NB include the 1-run penalty)
 */
export function extraBallLabel(type, runs) {
  const r = runs ?? 0;
  switch (type) {
    case 'wd': {
      const extra = Math.max(1, r) - 1;
      return extra > 0 ? `${extra}WD` : 'WD';
    }
    case 'nb': {
      const extra = Math.max(1, r) - 1;
      return extra > 0 ? `${extra}NB` : 'NB';
    }
    case 'bye':
      return r > 1 ? `${r}B` : 'B';
    case 'lb':
      return r > 1 ? `${r}LB` : 'LB';
    default:
      return type.toUpperCase();
  }
}

// ─── Over formatting ──────────────────────────────────────────────────────────

/**
 * Format a count of legal balls as an overs string (e.g. 8 → "1.2").
 */
export function ballsToOvers(balls) {
  const b = Number(balls) || 0;
  if (b === 0) return '0';
  return `${Math.floor(b / 6)}.${b % 6}`;
}

// ─── Ball list + over summaries (for BallsTab) ────────────────────────────────

/**
 * Build an annotated ball list with over summaries from ball history.
 * Extras (wd/nb) do not count toward the 6 legal balls.
 * A summary block appears after every 6th legal delivery.
 *
 * @param {object[]} ballHistory  UI-shape balls
 * @returns {{
 *   ballListWithMeta: Array<{ ball, overBallLabel, validCount, overIndex }>,
 *   overSummaries: Record<number, object>,
 * }}
 */
export function buildBallListWithMetaAndOverSummaries(ballHistory) {
  const list = [];
  const summaries = {};

  let validCount = 0;
  let currentOverIdx = 0;
  let cumulativeRuns = 0;
  let cumulativeWickets = 0;
  let currentOverBalls = [];
  let currentOverRuns = 0;

  const batsmanStatsMap = new Map();
  const bowlerStatsMap = new Map();
  const activeBatsmen = [];
  let currentOverBowlerId = null;
  let currentOverBowlerRuns = 0;

  for (const ball of ballHistory ?? []) {
    const isExtra = !isLegalDelivery(ball.type);
    const ballRuns = ball.runs ?? 0;
    const strikerId = ball.strikerId ?? ball.striker?.id;
    const bowlerId = ball.bowlerId;

    // Batsman stats accumulation
    if (strikerId) {
      if (!activeBatsmen.find((b) => b.id === strikerId)) activeBatsmen.push({ id: strikerId });
      if (!batsmanStatsMap.has(strikerId)) batsmanStatsMap.set(strikerId, { runs: 0, balls: 0 });
      const bs = batsmanStatsMap.get(strikerId);
      if (ball.type === 'runs') bs.runs += ballRuns;
      else if (ball.type === 'nb') bs.runs += ball.runsOffBat ?? Math.max(0, ballRuns - 1);
      if (!isExtra) bs.balls += 1;
    }

    if (ball.type === 'out' || ball.type === 'retired_hurt') {
      const outId = ball.striker?.id ?? strikerId;
      if (outId) {
        const idx = activeBatsmen.findIndex((b) => b.id === outId);
        if (idx !== -1) activeBatsmen.splice(idx, 1);
      }
    }

    // Bowler stats accumulation
    if (bowlerId) {
      if (!bowlerStatsMap.has(bowlerId)) {
        bowlerStatsMap.set(bowlerId, {
          balls: 0,
          runs: 0,
          wickets: 0,
          maidens: 0,
        });
      }
      const bws = bowlerStatsMap.get(bowlerId);
      bws.runs += ballRuns;
      if (!isExtra) bws.balls += 1;
      if (ball.type === 'out' && ball.dismissalType !== 'retired_hurt') bws.wickets += 1;
      currentOverBowlerId = bowlerId;
      currentOverBowlerRuns = ballRuns;
    }

    cumulativeRuns += getRunsFromBall(ball);
    if (ball.type === 'out' && ball.dismissalType !== 'retired_hurt') cumulativeWickets += 1;
    currentOverRuns += getRunsFromBall(ball);
    currentOverBalls.push(ball);

    if (!isExtra) validCount += 1;

    // Over-ball label: e.g. "2.3" = 3rd ball of 2nd over
    const overBallLabel = validCount > 0 ? `${Math.floor((validCount - 1) / 6) + 1}.${((validCount - 1) % 6) + 1}` : '0.0';

    list.push({ ball, overBallLabel, validCount, overIndex: currentOverIdx });

    // End of a completed over (every 6th legal delivery)
    if (!isExtra && validCount % 6 === 0) {
      // Maiden detection: over bowler conceded 0 runs this over
      if (currentOverBowlerId && bowlerStatsMap.has(currentOverBowlerId) && currentOverBowlerRuns === 0) {
        bowlerStatsMap.get(currentOverBowlerId).maidens += 1;
      }

      const creaseSnapshot = activeBatsmen.slice(-2).map(({ id }) => {
        const stats = batsmanStatsMap.get(id) ?? { runs: 0, balls: 0 };
        return { id, runs: stats.runs, balls: stats.balls };
      });

      const bowlerSnapshot =
        currentOverBowlerId && bowlerStatsMap.has(currentOverBowlerId)
          ? {
              id: currentOverBowlerId,
              ...bowlerStatsMap.get(currentOverBowlerId),
            }
          : null;

      summaries[currentOverIdx] = {
        balls: [...currentOverBalls],
        overRuns: currentOverRuns,
        cumulativeRuns,
        cumulativeWickets,
        completedOvers: validCount / 6,
        creaseSnapshot,
        bowlerSnapshot,
      };

      currentOverIdx += 1;
      currentOverBalls = [];
      currentOverRuns = 0;
      currentOverBowlerId = null;
      currentOverBowlerRuns = 0;
    }
  }

  return { ballListWithMeta: list, overSummaries: summaries };
}

// ─── Over strip ───────────────────────────────────────────────────────────────

const LEGAL_DELIVERIES_PER_OVER = 6;

/**
 * Build the over-strip data from ball history.
 * Returns an array of { overIndex, runs, balls } — one entry per completed or
 * current over.
 *
 * @param {object[]} ballHistory  UI-shape balls
 * @returns {{ overIndex: number, runs: number, balls: object[] }[]}
 */
export function buildOversFromBalls(ballHistory) {
  const list = [];
  let currentOver = [];
  let validCount = 0;

  for (const ball of ballHistory ?? []) {
    currentOver.push(ball);
    if (isLegalDelivery(ball.type)) validCount += 1;
    if (validCount === LEGAL_DELIVERIES_PER_OVER) {
      const runs = currentOver.reduce((s, b) => s + getRunsFromBall(b), 0);
      list.push({ overIndex: list.length + 1, runs, balls: currentOver });
      currentOver = [];
      validCount = 0;
    }
  }
  if (currentOver.length > 0) {
    const runs = currentOver.reduce((s, b) => s + getRunsFromBall(b), 0);
    list.push({ overIndex: list.length + 1, runs, balls: currentOver });
  }
  return list;
}

// ─── Match result helpers ─────────────────────────────────────────────────────

/**
 * Compute a human-readable match result summary from live scores.
 * Used by MatchResultBanner and the innings-end dialog.
 *
 * @param {object|null} match
 * @param {{ totalRuns, totalWickets }|null} liveScore1
 * @param {{ totalRuns, totalWickets }|null} liveScore2
 * @returns {{ tie, winningTeamId, titleLine, marginLine?, detailLine?, scoresLine? }}
 */
export function computeMatchResultSummary(match, liveScore1, liveScore2) {
  const inn1 = liveScore1?.totalRuns ?? 0;
  const inn2 = liveScore2?.totalRuns ?? 0;
  const wickets2 = liveScore2?.totalWickets ?? 0;
  const target = inn1 + 1;
  const maxWickets = match?.playersPerSide != null ? Number(match.playersPerSide) - 1 : 10;
  const teamA = match?.teamA?.name?.trim() ?? '';
  const teamB = match?.teamB?.name?.trim() ?? '';
  const teamAId = match?.teamA?.id != null ? Number(match.teamA.id) : null;
  const teamBId = match?.teamB?.id != null ? Number(match.teamB.id) : null;

  const chasingWon = inn2 >= target;
  const runsShort = target - 1 - inn2;

  if (!chasingWon && runsShort === 0) {
    return {
      tie: true,
      winningTeamId: null,
      titleLine: 'Match tied',
      detailLine: [teamA, teamB].filter(Boolean).length
        ? `${teamA || 'Team A'} ${inn1} · ${teamB || 'Team B'} ${inn2}`
        : `Scores level at ${inn1} runs each.`,
    };
  }

  if (chasingWon) {
    const wkts = maxWickets - wickets2;
    const margin = `${wkts} wicket${wkts !== 1 ? 's' : ''}`;
    return {
      tie: false,
      winningTeamId: teamBId,
      titleLine: teamB ? `${teamB} won` : 'Chasing team won',
      marginLine: `by ${margin}`,
      scoresLine: `${teamA || 'Team A'} ${inn1} · ${teamB || 'Team B'} ${inn2}`,
    };
  }

  const margin = `${runsShort} run${runsShort !== 1 ? 's' : ''}`;
  return {
    tie: false,
    winningTeamId: teamAId,
    titleLine: teamA ? `${teamA} won` : 'Defending team won',
    marginLine: `by ${margin}`,
    scoresLine: `${teamA || 'Team A'} ${inn1} · ${teamB || 'Team B'} ${inn2}`,
  };
}

/**
 * Resolve the Man of the Match winner scope (single team vs both teams).
 *
 * @param {number|null|undefined} winningTeamIdFromApi
 * @param {{ tie?: boolean, winningTeamId?: number|null }|undefined} liveSummary
 * @returns {{ winnerId: number|null, useBothTeams: boolean }}
 */
export function resolveManOfMatchWinnerScope(winningTeamIdFromApi, liveSummary) {
  const apiWinner = winningTeamIdFromApi != null ? Number(winningTeamIdFromApi) : null;
  const liveWinner = liveSummary?.tie || liveSummary?.winningTeamId == null ? null : Number(liveSummary.winningTeamId);
  const winnerId = apiWinner ?? liveWinner;
  const useBothTeams = winnerId == null || Number.isNaN(winnerId);

  return { winnerId: useBothTeams ? null : winnerId, useBothTeams };
}

/**
 * Pure helper — merge two player arrays, deduplicating by id.
 *
 * @param {object[]} teamAPlayers
 * @param {object[]} teamBPlayers
 * @returns {object[]}
 */
export function mergeDedupedPlayerRows(teamAPlayers, teamBPlayers) {
  const map = new Map();
  for (const p of [...teamAPlayers, ...teamBPlayers]) {
    if (p && Number.isFinite(p.id)) map.set(p.id, p);
  }
  return [...map.values()];
}

/**
 * Playing-eleven players eligible for Man of the Match.
 * Winner: winning team only. Tie / no decisive winner: both teams (deduped).
 *
 * @param {object} params
 * @param {number|null} params.winningTeamIdFromApi
 * @param {object|null} params.liveSummary
 * @param {number|null} params.homeTeamId
 * @param {number|null} params.awayTeamId
 * @param {{ player_ids: number[] }|undefined} params.playingElevenHome
 * @param {{ player_ids: number[] }|undefined} params.playingElevenAway
 * @param {object[]} params.squadHome
 * @param {object[]} params.squadAway
 * @returns {{ id: number, name: string, teamId: number|null }[]}
 */
export function buildPlayerOfMatchCandidates({
  winningTeamIdFromApi,
  liveSummary,
  homeTeamId,
  awayTeamId,
  playingElevenHome,
  playingElevenAway,
  squadHome,
  squadAway,
}) {
  const squadArr = (s) => (Array.isArray(s) ? s : []);
  const nameFor = (squad, uid) => {
    const u = squadArr(squad).find((p) => String(p.id ?? p.user_id) === String(uid));
    return u?.name ?? u?.nickname ?? `Player ${uid}`;
  };
  const mapTeam = (teamId, ids, squad) =>
    (ids ?? [])
      .map((rawId) => {
        const id = Number(rawId);
        if (!Number.isFinite(id)) return null;
        return {
          id,
          name: nameFor(squad, rawId),
          teamId: teamId != null ? Number(teamId) : null,
        };
      })
      .filter(Boolean);

  const hid = homeTeamId != null ? Number(homeTeamId) : null;
  const aid = awayTeamId != null ? Number(awayTeamId) : null;
  const homeIds = playingElevenHome?.player_ids ?? [];
  const awayIds = playingElevenAway?.player_ids ?? [];

  const { winnerId, useBothTeams } = resolveManOfMatchWinnerScope(winningTeamIdFromApi, liveSummary);

  if (useBothTeams) {
    return mergeDedupedPlayerRows(mapTeam(hid, homeIds, squadHome), mapTeam(aid, awayIds, squadAway));
  }

  if (hid != null && winnerId === hid) return mapTeam(hid, homeIds, squadHome);
  if (aid != null && winnerId === aid) return mapTeam(aid, awayIds, squadAway);

  return mergeDedupedPlayerRows(mapTeam(hid, homeIds, squadHome), mapTeam(aid, awayIds, squadAway));
}
