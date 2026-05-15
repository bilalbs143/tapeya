/**
 * scoringReplay.js
 *
 * Replay ball history to reconstruct full innings state.
 * Used when loading a match from the API so scoring can resume seamlessly.
 *
 * Pure function — no React, no side effects.
 */

import {
  causesStrikeRotation,
  computePendingFreeHit,
  isLegalDelivery,
} from './cricketRules';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Ensure a player ID is in the ordered batting list (first appearance wins). */
function ensureBattingOrder(battingOrder, id) {
  if (id == null) return;
  const key = String(id);
  if (!battingOrder.find((x) => String(x) === key)) battingOrder.push(id);
}

/** Get or initialise a batsman stats record. */
function getOrCreateBatsman(batsmanStats, id, battingPlayers) {
  if (id == null) return null;
  const key = String(id);
  if (!batsmanStats[key]) {
    const player = battingPlayers.find((x) => String(x.id) === key);
    batsmanStats[key] = {
      id,
      name: player?.name ?? player?.nickname ?? `Player ${id}`,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
    };
  }
  return batsmanStats[key];
}

/** Get or initialise a bowler stats record. */
function getOrCreateBowler(bowlerStats, id, bowlingPlayers) {
  if (id == null) return null;
  const key = String(id);
  if (!bowlerStats[key]) {
    const player = bowlingPlayers.find((x) => String(x.id) === key);
    bowlerStats[key] = {
      id,
      name: player?.name ?? player?.nickname ?? `Player ${id}`,
      overs: '0',
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
    };
  }
  return bowlerStats[key];
}

/** Format a legal ball count as "overs.balls" display string. */
function formatOvers(balls) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

// ─── Partnership tracker ──────────────────────────────────────────────────────

function createPartnershipTracker(strikerId, nonStrikerId) {
  return {
    player1Id: strikerId,
    player2Id: nonStrikerId,
    runs: 0,
    balls: 0,
    p1Runs: 0,
    p1Balls: 0,
    p2Runs: 0,
    p2Balls: 0,
  };
}

function addRunsToPartnership(tracker, scorerId, runs, isLegal) {
  if (!tracker) return;
  const key1 = String(tracker.player1Id);
  const scorerKey = String(scorerId);
  tracker.runs += runs;
  if (isLegal) tracker.balls += 1;
  if (scorerKey === key1) {
    tracker.p1Runs += runs;
    if (isLegal) tracker.p1Balls += 1;
  } else {
    tracker.p2Runs += runs;
    if (isLegal) tracker.p2Balls += 1;
  }
}

function addExtraToPartnership(tracker, extraRuns) {
  if (!tracker) return;
  tracker.runs += extraRuns;
}

function snapshotPartnership(tracker, batsmanStats, ballIndex) {
  if (!tracker || (tracker.runs === 0 && tracker.balls === 0)) return null;
  const { player1Id, player2Id } = tracker;
  const p1 = batsmanStats[String(player1Id)];
  const p2 = batsmanStats[String(player2Id)];
  const [stayRuns, stayBalls, outRuns, outBalls] =
    tracker.p1Runs !== undefined
      ? [tracker.p1Runs, tracker.p1Balls, tracker.p2Runs, tracker.p2Balls]
      : [0, 0, 0, 0];
  return {
    id: `p-${ballIndex}-${player1Id}-${player2Id}`,
    batter1: { name: p1?.name ?? '—', runs: stayRuns, balls: stayBalls },
    batter2: { name: p2?.name ?? '—', runs: outRuns, balls: outBalls },
    runs: tracker.runs,
    balls: tracker.balls,
  };
}

// ─── Main replay function ─────────────────────────────────────────────────────

/**
 * Replay a UI-shape ball history array and reconstruct full innings state.
 *
 * @param {object[]} ballHistory      UI-shape balls (from apiBallToUiBall)
 * @param {object[]} battingPlayers   [{ id, name }] batting playing XI
 * @param {object[]} bowlingPlayers   [{ id, name }] bowling playing XI
 *
 * @returns {{
 *   batsmenOnCrease:       object[],          // 1-2 batsman stat objects
 *   strikerIndex:          number,            // 0 or 1 — index into batsmenOnCrease
 *   retiredBatsmen:        object[],          // batsmen who retired hurt (may return)
 *   bowlersInTable:        object[],          // all bowlers seen so far
 *   currentBowlerIndex:    number,            // index into bowlersInTable
 *   completedPartnerships: object[],          // finished partnerships
 *   currentPartnership:    { runs, balls },   // live partnership
 *   pendingFreeHit:        boolean,           // is next delivery a free hit?
 * }}
 */
export function replayBallHistory(
  ballHistory,
  battingPlayers = [],
  bowlingPlayers = [],
) {
  const balls = ballHistory ?? [];

  // ── State ──────────────────────────────────────────────────────────────────
  const battingOrder = []; // ordered list of batsman IDs seen
  const batsmanStats = {}; // id → { id, name, runs, balls, fours, sixes }
  const bowlerStats = {}; // id → { id, name, overs, balls, maidens, runs, wickets }
  const retiredBatsmen = []; // batsmen who retired hurt (removed from crease, not a wicket)
  const completedPartnerships = [];

  let strikerId = null;
  let nonStrikerId = null;
  let currentBowlerId = null;
  let pendingFreeHit = false;
  let partnershipTracker = null;

  // Over-level state for maiden detection
  let currentOverBowlerId = null;
  let currentOverRunsConceded = 0;
  let currentOverLegalBalls = 0;

  // ── Seed opener IDs from the first ball ──────────────────────────────────
  if (balls.length > 0) {
    const first = balls[0];
    const sid = first.strikerId ?? first.striker?.id;
    const nid = first.nonStrikerId;
    strikerId = sid ?? null;
    nonStrikerId = nid ?? null;

    if (strikerId != null) {
      ensureBattingOrder(battingOrder, strikerId);
      getOrCreateBatsman(batsmanStats, strikerId, battingPlayers);
    }
    if (nonStrikerId != null) {
      ensureBattingOrder(battingOrder, nonStrikerId);
      getOrCreateBatsman(batsmanStats, nonStrikerId, battingPlayers);
    }
    if (strikerId != null && nonStrikerId != null) {
      partnershipTracker = createPartnershipTracker(strikerId, nonStrikerId);
    }
  }

  // ── Replay ────────────────────────────────────────────────────────────────
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    const { type } = ball;
    const runs = ball.runs ?? 0;
    const penaltyRuns =
      ball.penaltyRuns ?? ball.penalty_runs ?? 0;

    const sid = ball.strikerId ?? ball.striker?.id ?? strikerId;
    const nid = ball.nonStrikerId ?? nonStrikerId;
    const bid = ball.bowlerId ?? null;

    // Ensure batsmen records exist
    ensureBattingOrder(battingOrder, sid);
    ensureBattingOrder(battingOrder, nid);
    const striker = getOrCreateBatsman(batsmanStats, sid, battingPlayers);
    const nonStriker = getOrCreateBatsman(batsmanStats, nid, battingPlayers);
    const bowler = getOrCreateBowler(bowlerStats, bid, bowlingPlayers);

    strikerId = sid;
    nonStrikerId = nid;

    // Track over change when bowler changes (simple heuristic: new bowler after 6 legals)
    if (bid != null && bid !== currentOverBowlerId) {
      // Over boundary: record maiden if applicable, reset over counters
      if (currentOverBowlerId != null && currentOverLegalBalls === 6) {
        const prevBowler = bowlerStats[String(currentOverBowlerId)];
        if (prevBowler && currentOverRunsConceded === 0) {
          prevBowler.maidens += 1;
        }
      }
      currentOverBowlerId = bid;
      currentOverRunsConceded = 0;
      currentOverLegalBalls = 0;
    }

    const legal = isLegalDelivery(type);

    // ── Retired Hurt ────────────────────────────────────────────────────────
    if (type === 'retired_hurt') {
      const outId = ball.striker?.id ?? sid;
      const retiredBatsman = getOrCreateBatsman(
        batsmanStats,
        outId,
        battingPlayers,
      );

      // Close partnership
      if (partnershipTracker) {
        const snap = snapshotPartnership(partnershipTracker, batsmanStats, i);
        if (snap) completedPartnerships.push(snap);
      }

      // Move to retired list (NOT a wicket — batsman may return)
      if (
        retiredBatsman &&
        !retiredBatsmen.some((b) => String(b.id) === String(outId))
      ) {
        retiredBatsmen.push({ ...retiredBatsman });
      }

      // Determine who stays and who replaces
      const staysId = String(outId) === String(sid) ? nid : sid;
      const nextBall = balls[i + 1];
      let nextId = null;

      if (nextBall) {
        const nbSid = nextBall.strikerId ?? nextBall.striker?.id;
        const nbNid = nextBall.nonStrikerId;
        if (nbSid != null && String(nbSid) !== String(staysId)) nextId = nbSid;
        else if (nbNid != null && String(nbNid) !== String(staysId))
          nextId = nbNid;
      }

      if (nextId == null) {
        // Try next available batting player
        const next = battingPlayers.find(
          (p) =>
            !battingOrder.some((id) => String(id) === String(p.id)) &&
            !retiredBatsmen.some((b) => String(b.id) === String(p.id)),
        );
        nextId = next ? next.id : null;
      }

      if (nextId != null) {
        ensureBattingOrder(battingOrder, nextId);
        getOrCreateBatsman(batsmanStats, nextId, battingPlayers);
      }

      strikerId = String(outId) === String(sid) ? nextId : staysId;
      nonStrikerId = String(outId) === String(sid) ? staysId : nextId;
      partnershipTracker =
        strikerId != null && nonStrikerId != null
          ? createPartnershipTracker(strikerId, nonStrikerId)
          : null;
      currentBowlerId = bid;
      pendingFreeHit = computePendingFreeHit(
        balls.slice(0, i + 1),
        pendingFreeHit,
      );
      continue;
    }

    if (type === 'penalty') {
      const pr = penaltyRuns || 0;
      if (partnershipTracker && pr > 0) {
        addExtraToPartnership(partnershipTracker, pr);
      }
      currentBowlerId = bid;
      pendingFreeHit = computePendingFreeHit(
        balls.slice(0, i + 1),
        pendingFreeHit,
      );
      continue;
    }

    // ── Wicket (out) ─────────────────────────────────────────────────────────
    if (type === 'out') {
      const outId = ball.striker?.id ?? sid;
      const staysId = String(outId) === String(sid) ? nid : sid;

      // Close partnership
      if (partnershipTracker) {
        const snap = snapshotPartnership(partnershipTracker, batsmanStats, i);
        if (snap) completedPartnerships.push(snap);
      }

      // Bowler gets the wicket (retired_hurt handled above, never reaches here)
      if (bowler) bowler.wickets += 1;

      // Advance legal ball count before looking for next batsman
      if (legal && bowler) {
        bowler.balls += 1;
        currentOverLegalBalls += 1;
      }
      currentOverRunsConceded += runs;
      if (bowler) bowler.runs += runs;

      // Find next batsman
      const nextBall = balls[i + 1];
      let nextId = null;

      if (nextBall) {
        const nbSid = nextBall.strikerId ?? nextBall.striker?.id;
        const nbNid = nextBall.nonStrikerId;
        if (nbSid != null && String(nbSid) !== String(staysId)) nextId = nbSid;
        else if (nbNid != null && String(nbNid) !== String(staysId))
          nextId = nbNid;
      }

      if (nextId == null) {
        const next = battingPlayers.find(
          (p) => !battingOrder.some((id) => String(id) === String(p.id)),
        );
        nextId = next ? next.id : null;
      }

      if (nextId != null) {
        ensureBattingOrder(battingOrder, nextId);
        getOrCreateBatsman(batsmanStats, nextId, battingPlayers);
      }

      strikerId = String(outId) === String(sid) ? nextId : staysId;
      nonStrikerId = String(outId) === String(sid) ? staysId : nextId;
      partnershipTracker =
        strikerId != null && nonStrikerId != null
          ? createPartnershipTracker(strikerId, nonStrikerId)
          : null;
      currentBowlerId = bid;
      pendingFreeHit = computePendingFreeHit(
        balls.slice(0, i + 1),
        pendingFreeHit,
      );
      continue;
    }

    // ── Normal delivery ───────────────────────────────────────────────────────

    // Batting stats: regular deliveries + runs off bat on no-balls (ICC rules)
    if (striker) {
      if (type === 'runs') {
        striker.runs += runs;
        if (runs === 4) striker.fours += 1;
        if (runs === 6) striker.sixes += 1;
      } else if (type === 'nb') {
        // runs_off_bat available on API-sourced balls; for live balls compute as runs − 1 penalty
        const rob = ball.runsOffBat ?? Math.max(0, (runs ?? 1) - 1);
        striker.runs += rob;
        if (rob === 4) striker.fours += 1;
        if (rob === 6) striker.sixes += 1;
      }
      if (legal) striker.balls += 1;
    }

    // Bowler stats
    if (bowler) {
      bowler.runs += runs + penaltyRuns;
      if (legal) {
        bowler.balls += 1;
        currentOverLegalBalls += 1;
      }
    }
    currentOverRunsConceded += runs;

    let oddStrikeThisBall = false;

    // Strike rotation: legal bye / leg-bye with odd total runs (before over completion)
    if (
      (type === 'bye' || type === 'lb') &&
      legal &&
      runs % 2 === 1 &&
      strikerId != null &&
      nonStrikerId != null
    ) {
      oddStrikeThisBall = true;
      const tmp = strikerId;
      strikerId = nonStrikerId;
      nonStrikerId = tmp;
    }

    // Partnership tracking
    if (partnershipTracker) {
      if (type === 'runs') {
        addRunsToPartnership(partnershipTracker, sid, runs, legal);
      } else if (
        type === 'wd' ||
        type === 'nb' ||
        type === 'bye' ||
        type === 'lb'
      ) {
        addExtraToPartnership(partnershipTracker, runs);
        if (legal) partnershipTracker.balls += 1;
      }
    }

    currentBowlerId = bid;

    // Odd runs off the bat (before over completion)
    if (
      type === 'runs' &&
      causesStrikeRotation(runs) &&
      striker &&
      nonStriker
    ) {
      oddStrikeThisBall = true;
      const tmp = strikerId;
      strikerId = nonStrikerId;
      nonStrikerId = tmp;
    }

    // Maiden check + change of ends when 6 legal balls complete
    if (legal && currentOverLegalBalls === 6) {
      if (
        !oddStrikeThisBall &&
        strikerId != null &&
        nonStrikerId != null
      ) {
        const t = strikerId;
        strikerId = nonStrikerId;
        nonStrikerId = t;
      }
      const bws = bowlerStats[String(bid)];
      if (bws && currentOverRunsConceded === 0) {
        bws.maidens += 1;
      }
      // Reset over counters — next ball starts a fresh over
      currentOverBowlerId = null;
      currentOverRunsConceded = 0;
      currentOverLegalBalls = 0;
    }

    pendingFreeHit = computePendingFreeHit(
      balls.slice(0, i + 1),
      pendingFreeHit,
    );
  }

  // ── Finalise bowler overs display ─────────────────────────────────────────
  for (const bws of Object.values(bowlerStats)) {
    bws.overs = formatOvers(bws.balls);
  }

  // ── Build batsmenOnCrease ──────────────────────────────────────────────────
  const crease = [];
  if (strikerId != null) {
    const b = batsmanStats[String(strikerId)];
    if (b) crease.push(b);
  }
  if (nonStrikerId != null && String(nonStrikerId) !== String(strikerId)) {
    const b = batsmanStats[String(nonStrikerId)];
    if (b) crease.push(b);
  }

  // Striker index (0 = striker, 1 = non-striker)
  const strikerIndex =
    crease.length > 0
      ? crease.findIndex((b) => String(b.id) === String(strikerId))
      : 0;

  // ── Build bowlers list ─────────────────────────────────────────────────────
  const bowlersInTable = Object.values(bowlerStats);
  const currentBowlerIndex = bowlersInTable.findIndex(
    (b) => String(b.id) === String(currentBowlerId),
  );

  return {
    batsmenOnCrease: crease,
    strikerIndex: strikerIndex < 0 ? 0 : strikerIndex,
    retiredBatsmen,
    bowlersInTable,
    currentBowlerIndex: currentBowlerIndex >= 0 ? currentBowlerIndex : 0,
    completedPartnerships,
    currentPartnership: partnershipTracker
      ? { runs: partnershipTracker.runs, balls: partnershipTracker.balls }
      : { runs: 0, balls: 0 },
    pendingFreeHit,
  };
}
