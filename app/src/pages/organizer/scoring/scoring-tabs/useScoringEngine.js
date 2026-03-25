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
 * -----------------------------------------------------------------------------
 * CURSOR — Notes for future maintainers
 * -----------------------------------------------------------------------------
 *
 * useCallback does not give stable references here
 * ──────────────────────────────────────────────────
 *   All four handlers include ballHistory, batsmenOnCrease, bowlersInTable,
 *   strikerIndex, and currentBowlerIndex in their dependency arrays.  These
 *   values change on EVERY ball, so every handler gets a new reference after
 *   every delivery.  useCallback adds overhead with zero memoisation benefit
 *   for child components in the current design.
 *
 *   Two real solutions:
 *
 *   Option A — useRef for snapshot reads
 *     Store the scoring snapshot in a ref and read it inside stable callbacks:
 *       const scoringRef = useRef({});
 *       scoringRef.current = { ballHistory, batsmenOnCrease, ... };
 *       const handleRuns = useCallback((runs) => {
 *         const { ballHistory, batsmenOnCrease } = scoringRef.current;
 *         ...
 *       }, [appendBall, ...setters]); // setters are stable → truly stable ref
 *     Handlers become stable for the lifetime of the component.
 *     Downside: reads are slightly less idiomatic; lint rules won't catch stale deps.
 *
 *   Option B — useReducer in the parent (recommended)
 *     Move ballHistory, batsmenOnCrease, bowlersInTable, partnerships, indexes
 *     into a single scoringReducer.  The dispatch function is stable forever.
 *     Each action is one atomic update (no intermediate renders).
 *     Handlers become trivial: just dispatch({ type: 'RUNS', payload }).
 *     This also eliminates all the setter-plumbing passed into this hook.
 *
 * Atomicity
 * ──────────
 *   Each handler fires 4–8 separate setState calls.  React 18 batches these
 *   inside event handlers, but a useReducer (Option B above) makes every
 *   action one guaranteed atomic update and simplifies time-travel debugging.
 *
 * Constants
 * ──────────
 *   DASH is imported from @/lib/constants/ui.
 *
 * Docs
 * ────
 *   batsmenOnCrease entries must include partnerRunsAtStart / partnerBallsAtStart
 *   (set when batter takes the crease) so handleOut can compute per-stand contributions.
 *   Only setCompletedPartnerships is passed; the hook never reads completedPartnerships.
 * -----------------------------------------------------------------------------
 */

import { useCallback } from 'react';

import { DASH } from '@/lib/constants/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_DELIVERIES_PER_OVER = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Count legal deliveries in the current (incomplete) over from ball history.
 * WD/NB do not count. Used so we open the bowler dialog exactly after the 6th
 * legal ball even when there are extras in the over (avoids relying on bowler.balls).
 *
 * Returns 0 in two distinct situations:
 *   a) No balls have been bowled yet in this over (count never reached 6).
 *   b) The last 6 legal deliveries form a complete over (early return 0).
 * Callers only use this via willCompleteOver which checks for 5 — neither
 * zero case causes a problem there.
 *
 * @param {object[]} ballHistory
 * @returns {number} 0–5 (legal balls in current over)
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
 * Appends ball to local history then fires API sync.
 * When API responds, patches the last ball with id and dismissal_type_label (from backend).
 */
function appendBallImpl(setBallHistory, syncBallToApi, ball) {
  setBallHistory((prev) => [...prev, ball]);
  if (!syncBallToApi) return;
  syncBallToApi(ball, (data) => {
    if (!data) return;
    setBallHistory((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = {
          ...last,
          id: data.id ?? last.id,
          ...(last.type === 'out' &&
            data.dismissal_type_label != null && {
              dismissalLabel: data.dismissal_type_label,
            }),
        };
      }
      return copy;
    });
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}   p
 * @param {object[]} p.ballHistory              Read-only snapshot (for undo).
 * @param {Function} p.setBallHistory
 * @param {object[]} p.batsmenOnCrease          Read-only snapshot (max 2).
 *                                              Each entry must include:
 *                                                id, runs, balls, fours, sixes,
 *                                                partnerRunsAtStart, partnerBallsAtStart
 *                                              partnerRunsAtStart/partnerBallsAtStart must
 *                                              be set when the batter takes the crease so
 *                                              handleOut can compute per-stand contributions.
 * @param {Function} p.setBatsmenOnCrease
 * @param {object[]} p.bowlersInTable           Read-only snapshot (max 2).
 * @param {Function} p.setBowlersInTable
 * @param {number}   p.strikerIndex             0 or 1.
 * @param {Function} p.setStrikerIndex
 * @param {number}   p.currentBowlerIndex
 * @param {Function} p.setCurrentBowlerIndex
 * @param {object}   p.currentPartnership       { runs, balls } — REQUIRED for handleOut snapshot.
 * @param {Function} p.setCurrentPartnership
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
  // appendBall is stable when setBallHistory and syncBallToApi are stable refs —
  // setBallHistory always is (useState setter); syncBallToApi depends on the caller.
  const appendBall = useCallback(
    (ball) => appendBallImpl(setBallHistory, syncBallToApi, ball),
    [setBallHistory, syncBallToApi],
  );

  // ── handleRuns ─────────────────────────────────────────────────────────────

  /**
   * Records a legal run-scoring delivery.
   *
   * NOTE: useCallback deps include ballHistory/batsmenOnCrease/etc. which change
   * every ball, so this reference changes every ball too.  See top comment for
   * the useRef / useReducer alternatives that give a truly stable reference.
   *
   * @param {number}      runs
   * @param {string|null} shotDirection  Optional zone ID from shot-area diagram.
   */
  const handleRuns = useCallback(
    function handleRuns(runs, shotDirection = null) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      const striker = batsmenOnCrease[strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];
      const overDone = willCompleteOver(ballHistory);
      // hasTwoBowlers: only rotate bowler index when there are two bowlers (one per end).
      // If length === 1 the guard above still passes but rotation is intentionally skipped.
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

      setCurrentPartnership((p) => ({
        runs: p.runs + runs,
        balls: p.balls + 1,
      }));

      if (runs % 2 === 1) setStrikerIndex((i) => 1 - i);
      if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
      if (overDone) setAddBowlerOpen(true);
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      appendBall,
      setBatsmenOnCrease,
      setBowlersInTable,
      setCurrentPartnership,
      setStrikerIndex,
      setCurrentBowlerIndex,
      setAddBowlerOpen,
    ],
  );

  // ── handleSpecial ──────────────────────────────────────────────────────────

  /**
   * Records an extra: wide (wd), no-ball (nb), bye, or leg-bye (lb).
   *
   * Over counter rules:
   *   WD / NB → NOT a legal delivery; over counter does NOT advance.
   *   BYE / LB → IS a legal delivery; over counter advances normally.
   *
   * For WD/NB, extraRuns is the total runs from the delivery (0–6+). Default 1.
   * For bye/lb, extraRuns is the runs taken (0–6). Odd runs swap strike.
   *
   * No-ball: striker's personal ball count increments (they faced it)
   * even though the over counter does not advance.
   *
   * FIX (BUG-7): strikerId is now stored on NB balls so handleUndo can
   * reverse the striker's ball count correctly.
   *
   * NOTE: same useCallback / stable-reference caveat as handleRuns (see top comment).
   *
   * @param {'wd'|'nb'|'bye'|'lb'} type
   * @param {number} [extraRuns] – runs from this delivery (wd/nb default 1, bye/lb default 0).
   */
  const handleSpecial = useCallback(
    function handleSpecial(type, extraRuns = undefined) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      // Guard: warn if an unexpected type is passed — would silently produce 0 extraRun.
      if (!['wd', 'nb', 'bye', 'lb'].includes(type)) {
        console.warn(
          '[useScoringEngine] handleSpecial: unexpected type:',
          type,
        );
        return;
      }

      const striker = batsmenOnCrease[strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];

      const extraRun =
        type === 'wd' || type === 'nb'
          ? Math.max(0, Number(extraRuns) || 1)
          : Math.max(0, Number(extraRuns) || 0); // bye / lb

      const isLegal = type === 'bye' || type === 'lb';
      const overDone = isLegal && willCompleteOver(ballHistory);
      const hasTwoBowlers = bowlersInTable.length >= 2;

      appendBall({
        type,
        runs: extraRun,
        bowlerId: bowler?.id,
        strikerId: striker?.id,
      });

      // NB: striker personally faces the ball (ball count goes up for their stats)
      // even though it is not a legal delivery for over-counter purposes.
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

      if (type === 'wd' || type === 'nb') {
        setCurrentPartnership((p) => ({ ...p, runs: p.runs + extraRun }));
      } else {
        // bye / lb — legal delivery, so partnership ball count advances too
        setCurrentPartnership((p) => ({
          ...p,
          runs: p.runs + extraRun,
          balls: p.balls + 1,
        }));
      }

      if (isLegal && extraRun % 2 === 1) setStrikerIndex((i) => 1 - i);
      if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
      if (overDone) setAddBowlerOpen(true);
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      appendBall,
      setBatsmenOnCrease,
      setBowlersInTable,
      setCurrentPartnership,
      setStrikerIndex,
      setCurrentBowlerIndex,
      setAddBowlerOpen,
    ],
  );

  // ── handleOut ──────────────────────────────────────────────────────────────

  /**
   * Records a dismissal.
   *
   * FIX (BUG-1): currentPartnership is snapshotted onto the ball object so
   * handleUndo can restore it exactly.
   *
   * After a wicket, setStrikerIndex(0) is called so the caller knows the new
   * batter (appended to batsmenOnCrease by the parent) will be at index 0.
   * ASSUMPTION: the parent always appends the new batter and the newly arrived
   * batter should become the striker. If this convention changes, update here.
   *
   * NOTE: same useCallback / stable-reference caveat as handleRuns (see top comment).
   *
   * @param {string}        dismissalType  e.g. 'bowled', 'caught', 'run_out'.
   * @param {number|string} [fielderId]    Required for caught / stumped / run_out.
   */
  const handleOut = useCallback(
    function handleOut(dismissalType, fielderId = undefined) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      const striker = batsmenOnCrease[strikerIndex];
      const nonStriker = batsmenOnCrease[1 - strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];
      const overDone = willCompleteOver(ballHistory);
      const hasTwoBowlers = bowlersInTable.length >= 2;

      const partnershipSnapshot = {
        runs: currentPartnership?.runs ?? 0,
        balls: currentPartnership?.balls ?? 0,
      };

      // Per-batter contributions in this stand.
      // Requires partnerRunsAtStart / partnerBallsAtStart to be set on batter objects
      // when they take the crease (see JSDoc at top of hook).
      const strikerContrib = {
        runs: (striker?.runs ?? 0) - (striker?.partnerRunsAtStart ?? 0),
        balls: (striker?.balls ?? 0) - (striker?.partnerBallsAtStart ?? 0),
      };
      const nonStrikerContrib = {
        runs: (nonStriker?.runs ?? 0) - (nonStriker?.partnerRunsAtStart ?? 0),
        balls:
          (nonStriker?.balls ?? 0) - (nonStriker?.partnerBallsAtStart ?? 0),
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

      setCurrentPartnership({ runs: 0, balls: 0 });

      appendBall({
        type: 'out',
        striker: { ...striker },
        bowlerId: bowler?.id,
        dismissalType: dismissalType ?? null,
        // Fixed: was `fielderId ?? undefined` which is a no-op — `?? undefined`
        // never changes the value since undefined is already the default.
        // Use `|| undefined` to also exclude falsy non-null values (e.g. 0, '').
        fielderId: fielderId || undefined,
        partnershipSnapshot,
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

      // setStrikerIndex(0): assumes new batter is appended at index 0 by parent.
      // See ASSUMPTION note in JSDoc above.
      setStrikerIndex(0);

      if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
      if (overDone) setAddBowlerOpen(true);

      setOutReasonModalOpen(false);
      setPendingDismissal(null);
      setFielderPickerOpen(false);
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      currentPartnership,
      appendBall,
      setCompletedPartnerships,
      setCurrentPartnership,
      setBowlersInTable,
      setBatsmenOnCrease,
      setStrikerIndex,
      setCurrentBowlerIndex,
      setAddBowlerOpen,
      setOutReasonModalOpen,
      setPendingDismissal,
      setFielderPickerOpen,
    ],
  );

  // ── handleUndo ─────────────────────────────────────────────────────────────

  /**
   * Reverses the most recent ball and all state it affected.
   * Handles: 'runs', 'out', 'wd', 'nb', 'bye', 'lb'.
   *
   * Enhancement: For atomicity and fewer intermediate renders, consider
   * migrating to a useReducer in the parent (see file-top comment).
   *
   * NOTE: same useCallback / stable-reference caveat as handleRuns (see top comment).
   */
  const handleUndo = useCallback(
    function handleUndo() {
      const last = ballHistory[ballHistory.length - 1];
      if (!last) return;

      if (last.id != null && syncUndoToApi) syncUndoToApi(last.id);
      setBallHistory((prev) => prev.slice(0, -1));

      // restoreBowlerIndex: captures bowlersInTable from the closure.
      // Safe — bowlersInTable is in this useCallback's dep array so it is
      // always the current snapshot when handleUndo fires.
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

        setCompletedPartnerships((prev) => prev.slice(0, -1));

        if (last.partnershipSnapshot) {
          setCurrentPartnership(last.partnershipSnapshot);
        } else {
          // Guard: snapshot missing on balls loaded from older API data (pre BUG-1 fix).
          console.warn(
            '[useScoringEngine] Missing partnershipSnapshot on OUT ball. id:',
            last.id,
          );
          setCurrentPartnership({ runs: 0, balls: 0 });
        }

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

        // FIX (BUG-7): reverse NB striker ball count — strikerId stored on ball
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
          const runsToSubtract = last.runs ?? 1;
          setCurrentPartnership((p) => ({
            ...p,
            runs: Math.max(0, p.runs - runsToSubtract),
          }));
        } else {
          // bye / lb
          const runsToSubtract = last.runs ?? 0;
          setCurrentPartnership((p) => ({
            ...p,
            runs: Math.max(0, p.runs - runsToSubtract),
            balls: Math.max(0, p.balls - 1),
          }));
          if (runsToSubtract % 2 === 1) setStrikerIndex((i) => 1 - i);
        }

        restoreBowlerIndex(last.bowlerId);
      }
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      setBallHistory,
      setBatsmenOnCrease,
      setBowlersInTable,
      setCurrentPartnership,
      setCompletedPartnerships,
      setStrikerIndex,
      setCurrentBowlerIndex,
      syncUndoToApi,
    ],
  );

  return { handleRuns, handleSpecial, handleOut, handleUndo };
}
