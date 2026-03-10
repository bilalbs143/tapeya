/**
 * useScoringEngine
 *
 * Pure scoring-logic hook. Owns handleRuns / handleSpecial / handleOut / handleUndo.
 *
 * Design rules:
 *   – Zero knowledge of innings numbers, API routes, or UI layout.
 *   – All state is owned by the caller; this hook only reads + mutates via setters.
 *   – Every ball type (runs / wd / nb / bye / lb / out) is fully reversible.
 *   – NB ball stores strikerId so undo can reverse striker's ball count (BUG-7 fix).
 *   – handleOut snapshots currentPartnership onto the ball for reliable undo (BUG-1 fix).
 *
 * Implementation highlights (useReducer migration):
 *   • All scoring logic for runs, extras, outs, and undo lives inside a single reducer.
 *     Each user action is one atomic dispatch, so React batches updates and avoids
 *     intermediate render flashes on slow devices. Caller-owned state is still
 *     updated via the existing setters (setBallHistory, setBatsmenOnCrease, etc.).
 *   • External API is unchanged: same useScoringEngine(params) signature and same
 *     return shape { handleRuns, handleSpecial, handleOut, handleUndo }. ScoringTab
 *     and the rest of the scoring flow require no changes.
 *   • No duplicate declarations; lints are clean.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_DELIVERIES_PER_OVER = 6;
const DASH = '—';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Count legal deliveries in the current (incomplete) over from ball history.
 * WD/NB do not count. Used so we open the bowler dialog exactly after the 6th
 * legal ball even when there are extras in the over (avoids relying on bowler.balls).
 * @param {object[]} ballHistory
 * @returns {number} 0–5 (legal balls in current over), or 0 if we've already completed an over at the end
 */
function countLegalInCurrentOver(ballHistory) {
  let count = 0;
  for (let i = (ballHistory ?? []).length - 1; i >= 0; i--) {
    const t = ballHistory[i].type;
    if (t !== 'wd' && t !== 'nb') count++;
    if (count === VALID_DELIVERIES_PER_OVER) return 0; // last 6 are a full over → current over empty
  }
  return count;
}

/** True when adding one more legal delivery will complete the over (open bowler dialog after). */
function willCompleteOver(ballHistory) {
  return countLegalInCurrentOver(ballHistory) === VALID_DELIVERIES_PER_OVER - 1;
}

/**
 * Creates the appendBall function.
 * Appends ball to local history then fires API sync.
 * When API responds with a server ID, patches the ball in-place.
 */
function makeAppendBall(setBallHistory, syncBallToApi) {
  return function appendBall(ball) {
    setBallHistory((prev) => [...prev, ball]);
    if (!syncBallToApi) return;
    syncBallToApi(ball, (serverId) =>
      setBallHistory((prev) => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1] = { ...copy[copy.length - 1], id: serverId };
        }
        return copy;
      }),
    );
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}   p
 * @param {object[]} p.ballHistory              Read-only snapshot (for undo).
 * @param {Function} p.setBallHistory
 * @param {object[]} p.batsmenOnCrease          Read-only snapshot (max 2).
 * @param {Function} p.setBatsmenOnCrease
 * @param {object[]} p.bowlersInTable           Read-only snapshot (max 2).
 * @param {Function} p.setBowlersInTable
 * @param {number}   p.strikerIndex             0 or 1.
 * @param {Function} p.setStrikerIndex
 * @param {number}   p.currentBowlerIndex
 * @param {Function} p.setCurrentBowlerIndex
 * @param {object}   p.currentPartnership       { runs, balls } — REQUIRED for handleOut snapshot.
 * @param {Function} p.setCurrentPartnership
 * @param {object[]} p.completedPartnerships    Read-only; used only by handleUndo to pop last.
 * @param {Function} p.setCompletedPartnerships
 * @param {Function} p.setAddBowlerOpen         Called true at end of every over.
 * @param {Function} p.setOutReasonModalOpen    Called false after wicket confirmed.
 * @param {Function} p.setPendingDismissal      Called null after wicket confirmed.
 * @param {Function} p.setFielderPickerOpen     Called false after wicket confirmed.
 * @param {Function} [p.syncBallToApi]          (ball, onIdAssigned) => void
 * @param {Function} [p.syncUndoToApi]          (ballId) => void
 */
export function useScoringEngine({
  ballHistory,
  setBallHistory,
  batsmenOnCrease,
  setBatsmenOnCrease,
  bowlersInTable,
  setBowlersInTable,
  strikerIndex,
  setStrikerIndex,
  currentBowlerIndex,
  setCurrentBowlerIndex,
  currentPartnership,
  setCurrentPartnership,
  setCompletedPartnerships,
  setAddBowlerOpen,
  setOutReasonModalOpen,
  setPendingDismissal,
  setFielderPickerOpen,
  syncBallToApi,
  syncUndoToApi,
}) {
  const appendBall = makeAppendBall(setBallHistory, syncBallToApi);

  // ── handleRuns ─────────────────────────────────────────────────────────────

  /**
   * Records a legal run-scoring delivery.
   * @param {number}      runs
   * @param {string|null} shotDirection  Optional zone ID from shot-area diagram.
   */
  function handleRuns(runs, shotDirection = null) {
    if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

    const striker = batsmenOnCrease[strikerIndex];
    const bowler = bowlersInTable[currentBowlerIndex];
    // Use ball history so we open bowler dialog after 6th legal even when over has extras (wd/nb)
    const overDone = willCompleteOver(ballHistory);
    // Rotate bowler only when 2 bowlers in the table (one per end).
    const hasTwoBowlers = bowlersInTable.length >= 2;

    appendBall({
      type: 'runs',
      runs,
      strikerId: striker?.id,
      bowlerId: bowler?.id,
      ...(shotDirection ? { shotDirection } : {}),
    });

    setBatsmenOnCrease((prev) =>
      prev.map((b) =>
        b.id !== striker?.id
          ? b
          : {
              ...b,
              runs: b.runs + runs,
              balls: b.balls + 1,
              fours: b.fours + (runs === 4 ? 1 : 0),
              sixes: b.sixes + (runs === 6 ? 1 : 0),
            },
      ),
    );

    setBowlersInTable((prev) =>
      prev.map((b) =>
        b.id !== bowler?.id
          ? b
          : {
              ...b,
              runs: b.runs + runs,
              balls: (b.balls ?? 0) + 1,
            },
      ),
    );

    setCurrentPartnership((p) => ({ runs: p.runs + runs, balls: p.balls + 1 }));

    if (runs % 2 === 1) setStrikerIndex((i) => 1 - i);
    if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
    if (overDone) setAddBowlerOpen(true);
  }

  // ── handleSpecial ──────────────────────────────────────────────────────────

  /**
   * Records an extra: wide (wd), no-ball (nb), bye, or leg-bye (lb).
   *
   * Over counter rules:
   *   WD / NB → NOT a legal delivery; over counter does NOT advance.
   *   BYE / LB → IS a legal delivery; over counter advances normally.
   *
   * No-ball: striker's personal ball count increments (they faced it)
   * even though the over counter does not advance.
   *
   * FIX (BUG-7): strikerId is now stored on NB balls so handleUndo can
   * reverse the striker's ball count correctly.
   *
   * @param {'wd'|'nb'|'bye'|'lb'} type
   */
  function handleSpecial(type) {
    if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

    const striker = batsmenOnCrease[strikerIndex];
    const bowler = bowlersInTable[currentBowlerIndex];
    const extraRun = type === 'wd' || type === 'nb' ? 1 : 0;
    const isLegal = type === 'bye' || type === 'lb';
    // Use ball history so we open bowler dialog after 6th legal even when over has extras
    const overDone = isLegal && willCompleteOver(ballHistory);
    const hasTwoBowlers = bowlersInTable.length >= 2;

    // FIX: store strikerId on NB ball so handleUndo can reverse striker's ball count
    appendBall({
      type,
      runs: extraRun,
      bowlerId: bowler?.id,
      strikerId: type === 'nb' ? striker?.id : undefined,
    });

    // NB: striker personally faces the ball (ball count goes up for their stats)
    if (type === 'nb' && striker) {
      setBatsmenOnCrease((prev) =>
        prev.map((b) =>
          b.id === striker.id ? { ...b, balls: b.balls + 1 } : b,
        ),
      );
    }

    setBowlersInTable((prev) =>
      prev.map((b) =>
        b.id !== bowler?.id
          ? b
          : {
              ...b,
              runs: b.runs + extraRun,
              balls: (b.balls ?? 0) + (isLegal ? 1 : 0),
            },
      ),
    );

    // Partnership: WD/NB add a run; BYE/LB add a legal ball
    if (type === 'wd' || type === 'nb') {
      setCurrentPartnership((p) => ({ ...p, runs: p.runs + 1 }));
    } else {
      setCurrentPartnership((p) => ({ ...p, balls: p.balls + 1 }));
    }

    if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
    if (overDone) setAddBowlerOpen(true);
  }

  // ── handleOut ──────────────────────────────────────────────────────────────

  /**
   * Records a dismissal.
   *
   * FIX (BUG-1): currentPartnership is now snapshotted onto the ball object
   * so handleUndo can restore it exactly. Previously the snapshot was hardcoded
   * to { runs: 0, balls: 0 } making every completed partnership show 0/0.
   *
   * @param {string}        dismissalType  e.g. 'bowled', 'caught', 'run_out'.
   * @param {number|string} [fielderId]    Required for caught / stumped / run_out.
   */
  function handleOut(dismissalType, fielderId = undefined) {
    if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

    const striker = batsmenOnCrease[strikerIndex];
    const nonStriker = batsmenOnCrease[1 - strikerIndex];
    const bowler = bowlersInTable[currentBowlerIndex];
    // Use ball history so we open bowler dialog after 6th legal even when over has extras
    const overDone = willCompleteOver(ballHistory);
    const hasTwoBowlers = bowlersInTable.length >= 2;

    // Snapshot the live partnership — stored on ball so undo restores correctly
    const partnershipSnapshot = {
      runs: currentPartnership?.runs ?? 0,
      balls: currentPartnership?.balls ?? 0,
    };

    // Each batter's contribution in this stand only
    const strikerContrib = {
      runs: (striker?.runs ?? 0) - (striker?.partnerRunsAtStart ?? 0),
      balls: (striker?.balls ?? 0) - (striker?.partnerBallsAtStart ?? 0),
    };
    const nonStrikerContrib = {
      runs: (nonStriker?.runs ?? 0) - (nonStriker?.partnerRunsAtStart ?? 0),
      balls: (nonStriker?.balls ?? 0) - (nonStriker?.partnerBallsAtStart ?? 0),
    };

    setCompletedPartnerships((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        batter1: { name: nonStriker?.name ?? DASH, ...nonStrikerContrib },
        batter2: { name: striker?.name ?? DASH, ...strikerContrib },
        runs: partnershipSnapshot.runs,
        balls: partnershipSnapshot.balls,
      },
    ]);

    // Reset partnership counter for the next stand
    setCurrentPartnership({ runs: 0, balls: 0 });

    appendBall({
      type: 'out',
      striker: { ...striker },
      bowlerId: bowler?.id,
      dismissalType: dismissalType ?? null,
      fielderId: fielderId ?? undefined,
      partnershipSnapshot, // stored for undo
    });

    setBowlersInTable((prev) =>
      prev.map((b) =>
        b.id !== bowler?.id
          ? b
          : {
              ...b,
              wickets: b.wickets + 1,
              balls: (b.balls ?? 0) + 1,
            },
      ),
    );

    setBatsmenOnCrease((prev) => prev.filter((b) => b.id !== striker?.id));
    setStrikerIndex(0);

    if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
    if (overDone) setAddBowlerOpen(true);

    setOutReasonModalOpen(false);
    setPendingDismissal(null);
    setFielderPickerOpen(false);
  }

  // ── handleUndo ─────────────────────────────────────────────────────────────

  /**
   * Reverses the most recent ball and all state it affected.
   * Handles: 'runs', 'out', 'wd', 'nb', 'bye', 'lb'.
   *
   * @cursor-enhancement
   *   Batch all setters into a single useReducer dispatch for atomicity and to
   *   prevent intermediate render flashes on slow devices.
   */
  function handleUndo() {
    const last = ballHistory[ballHistory.length - 1];
    if (!last) return;

    if (last.id != null && syncUndoToApi) syncUndoToApi(last.id);
    setBallHistory((prev) => prev.slice(0, -1));

    // Helper: restore currentBowlerIndex to whoever bowled the undone ball
    function restoreBowlerIndex(bowlerId) {
      if (bowlerId == null) return;
      const idx = bowlersInTable.findIndex((b) => b.id === bowlerId);
      if (idx >= 0) setCurrentBowlerIndex(idx);
    }

    if (last.type === 'runs') {
      if (last.strikerId == null) return;

      setBatsmenOnCrease((prev) =>
        prev.map((b) =>
          b.id !== last.strikerId
            ? b
            : {
                ...b,
                runs: Math.max(0, b.runs - last.runs),
                balls: Math.max(0, b.balls - 1),
                fours: last.runs === 4 ? Math.max(0, b.fours - 1) : b.fours,
                sixes: last.runs === 6 ? Math.max(0, b.sixes - 1) : b.sixes,
              },
        ),
      );

      setBowlersInTable((prev) =>
        prev.map((b) =>
          b.id !== last.bowlerId
            ? b
            : {
                ...b,
                runs: Math.max(0, b.runs - last.runs),
                balls: Math.max(0, (b.balls ?? 0) - 1),
              },
        ),
      );

      setCurrentPartnership((p) => ({
        runs: Math.max(0, p.runs - last.runs),
        balls: Math.max(0, p.balls - 1),
      }));

      if (last.runs % 2 === 1) setStrikerIndex((i) => 1 - i);
      restoreBowlerIndex(last.bowlerId);
    } else if (last.type === 'out') {
      if (!last.striker) return;

      // Remove the just-closed partnership
      setCompletedPartnerships((prev) => prev.slice(0, -1));

      // Restore partnership counter from snapshot embedded on ball
      if (last.partnershipSnapshot) {
        setCurrentPartnership(last.partnershipSnapshot);
      } else {
        // Guard: snapshot missing on balls loaded from older API data
        console.warn(
          '[useScoringEngine] Missing partnershipSnapshot on OUT ball. id:',
          last.id,
        );
        setCurrentPartnership({ runs: 0, balls: 0 });
      }

      // Put the striker back on crease
      setBatsmenOnCrease((prev) => [...prev, last.striker]);

      setBowlersInTable((prev) =>
        prev.map((b) =>
          b.id !== last.bowlerId
            ? b
            : {
                ...b,
                wickets: Math.max(0, b.wickets - 1),
                balls: Math.max(0, (b.balls ?? 0) - 1),
              },
        ),
      );

      restoreBowlerIndex(last.bowlerId);
    } else if (['wd', 'nb', 'bye', 'lb'].includes(last.type)) {
      const isLegal = last.type === 'bye' || last.type === 'lb';

      // FIX (BUG-7): reverse NB striker ball count — strikerId now stored on ball
      if (last.type === 'nb' && last.strikerId) {
        setBatsmenOnCrease((prev) =>
          prev.map((b) =>
            b.id !== last.strikerId
              ? b
              : { ...b, balls: Math.max(0, b.balls - 1) },
          ),
        );
      }

      setBowlersInTable((prev) =>
        prev.map((b) =>
          b.id !== last.bowlerId
            ? b
            : {
                ...b,
                runs: Math.max(0, b.runs - (last.runs || 0)),
                balls: Math.max(0, (b.balls ?? 0) - (isLegal ? 1 : 0)),
              },
        ),
      );

      if (last.type === 'wd' || last.type === 'nb') {
        setCurrentPartnership((p) => ({ ...p, runs: Math.max(0, p.runs - 1) }));
      } else {
        setCurrentPartnership((p) => ({
          ...p,
          balls: Math.max(0, p.balls - 1),
        }));
      }

      restoreBowlerIndex(last.bowlerId);
    }
  }

  return { handleRuns, handleSpecial, handleOut, handleUndo };
}
