/**
 * Replay ball history to derive current batsmen on crease, bowlers in table,
 * striker index, current bowler index, and completed partnerships.
 * Used when loading match from API so we can continue scoring.
 */

/**
 * @param {Array} ballHistory - UI shape balls (type, runs, strikerId, bowlerId, striker, etc.)
 * @param {Array} battingPlayers - [{ id, name }] playing eleven batting side
 * @param {Array} bowlingPlayers - [{ id, name }] playing eleven bowling side
 * @returns {{ batsmenOnCrease, bowlersInTable, strikerIndex, currentBowlerIndex, completedPartnerships }}
 */
export function replayBallHistory(
  ballHistory,
  battingPlayers = [],
  bowlingPlayers = [],
) {
  const battingOrder = [];
  const battingStats = {};
  const bowlingStats = {};
  let strikerId = null;
  let nonStrikerId = null;
  let currentBowlerId = null;
  const completedPartnerships = [];
  let partnershipRuns = 0;
  let partnershipBalls = 0;
  let p1Id = null;
  let p2Id = null;
  let p1Runs = 0;
  let p1Balls = 0;
  let p2Runs = 0;
  let p2Balls = 0;

  function ensureBattingOrder(id) {
    if (id == null) return;
    if (!battingOrder.includes(id)) battingOrder.push(id);
  }

  function getOrCreateBatsman(id) {
    if (id == null) return null;
    if (!battingStats[id]) {
      const p = battingPlayers.find((x) => String(x.id) === String(id));
      battingStats[id] = {
        id,
        name: p?.name ?? `Player ${id}`,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        partnerRunsAtStart: 0,
        partnerBallsAtStart: 0,
      };
    }
    return battingStats[id];
  }

  function getOrCreateBowler(id) {
    if (id == null) return null;
    if (!bowlingStats[id]) {
      const p = bowlingPlayers.find((x) => String(x.id) === String(id));
      bowlingStats[id] = {
        id,
        name: p?.name ?? `Player ${id}`,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        balls: 0,
      };
    }
    return bowlingStats[id];
  }

  const balls = ballHistory || [];
  if (balls.length > 0) {
    const first = balls[0];
    strikerId = first.strikerId ?? first.striker?.id;
    nonStrikerId =
      first.nonStrikerId ??
      (first.strikerId !== strikerId ? first.strikerId : null);
    if (strikerId != null) ensureBattingOrder(strikerId);
    if (nonStrikerId != null) ensureBattingOrder(nonStrikerId);
    const secondStriker =
      balls[0].nonStrikerId ??
      (strikerId === (first.strikerId ?? first.striker?.id)
        ? null
        : first.strikerId);
    if (secondStriker != null && !battingOrder.includes(secondStriker))
      battingOrder.push(secondStriker);
  }

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    const type = b.type;
    const runs = b.runs ?? 0;
    const sid = b.strikerId ?? b.striker?.id;
    const nid =
      b.nonStrikerId ??
      (b.striker?.id !== sid ? b.striker?.id : null) ??
      battingOrder[battingOrder.indexOf(sid) + 1] ??
      battingOrder[1];
    const bid = b.bowlerId;

    ensureBattingOrder(sid);
    ensureBattingOrder(nid);
    const striker = getOrCreateBatsman(sid);
    const nonStriker = getOrCreateBatsman(nid);
    const bowler = getOrCreateBowler(bid);
    if (!striker || !bowler) continue;

    if (type === 'out') {
      const outId = b.striker?.id ?? sid;
      const outBatsman = getOrCreateBatsman(outId);
      const stayedId = outId === sid ? nid : sid;
      const stayedBatsman = getOrCreateBatsman(stayedId);
      if (partnershipRuns > 0 || partnershipBalls > 0) {
        const stayRuns = outId === sid ? p2Runs : p1Runs;
        const stayBalls = outId === sid ? p2Balls : p1Balls;
        const outRuns = outId === sid ? p1Runs : p2Runs;
        const outBalls = outId === sid ? p1Balls : p2Balls;
        completedPartnerships.push({
          id: `p-${i}`,
          batter1: {
            name: stayedBatsman?.name ?? '—',
            runs: stayRuns,
            balls: stayBalls,
          },
          batter2: {
            name: outBatsman?.name ?? '—',
            runs: outRuns,
            balls: outBalls,
          },
          runs: partnershipRuns,
          balls: partnershipBalls,
        });
      }
      partnershipRuns = 0;
      partnershipBalls = 0;

      bowler.wickets += 1;
      bowler.balls += 1;
      const nextIn = battingPlayers.find(
        (p) => !battingOrder.some((id) => String(id) === String(p.id)),
      );
      const nextId = nextIn ? nextIn.id : null;
      if (nextId != null) battingOrder.push(nextId);
      getOrCreateBatsman(nextId);
      if (nextId != null) ensureBattingOrder(nextId);

      p1Id = nextId ?? nonStrikerId;
      p2Id = outId === sid ? nid : sid;
      p1Runs = 0;
      p1Balls = 0;
      p2Runs = 0;
      p2Balls = 0;
      strikerId = nextId ?? nonStrikerId;
      nonStrikerId = outId === sid ? nid : sid;
      currentBowlerId = bid;
      continue;
    }

    if (p1Id == null) p1Id = sid;
    if (p2Id == null) p2Id = nid;

    const isLegal = type !== 'wd' && type !== 'nb';
    if (type === 'runs') {
      striker.runs += runs;
      striker.fours += runs === 4 ? 1 : 0;
      striker.sixes += runs === 6 ? 1 : 0;
      partnershipRuns += runs;
      if (String(sid) === String(p1Id)) {
        p1Runs += runs;
      } else {
        p2Runs += runs;
      }
    }
    if (type === 'wd' || type === 'nb') partnershipRuns += 1;
    if (isLegal) {
      striker.balls += 1;
      partnershipBalls += 1;
      if (String(sid) === String(p1Id)) p1Balls += 1;
      else p2Balls += 1;
    }

    bowler.runs += runs;
    if (isLegal) bowler.balls += 1;
    strikerId = sid;
    nonStrikerId = nid;
    currentBowlerId = bid;

    if (runs % 2 === 1 && striker && nonStriker) {
      const swap = strikerId;
      strikerId = nonStrikerId;
      nonStrikerId = swap;
    }
  }

  const batsmenOnCrease = [
    strikerId != null ? getOrCreateBatsman(strikerId) : null,
    nonStrikerId != null ? getOrCreateBatsman(nonStrikerId) : null,
  ].filter(Boolean);

  const bowlerIds = Object.keys(bowlingStats);
  const bowlersInTable = bowlerIds.map((id) => bowlingStats[id]);
  const currentBowlerIdx = bowlersInTable.findIndex(
    (b) => String(b.id) === String(currentBowlerId),
  );
  const strikerIdx =
    batsmenOnCrease.length >= 2 &&
    String(batsmenOnCrease[0]?.id) === String(strikerId)
      ? 0
      : 1;

  return {
    batsmenOnCrease,
    bowlersInTable,
    strikerIndex: strikerIdx,
    currentBowlerIndex: currentBowlerIdx >= 0 ? currentBowlerIdx : 0,
    completedPartnerships,
  };
}
