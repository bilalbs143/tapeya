/**
 * useScoringEngine
 *
 * Pure scoring-logic hook. Owns five handlers:
 *   handleRuns       – legal delivery: runs scored off the bat
 *   handleSpecial    – extras: wd / nb / bye / lb
 *   handleOut        – dismissal (wicket)
 *   handleRetiredHurt – batsman retires hurt (NOT a wicket; may return)
 *   handleUndo       – reverses the most recent ball
 *
 * Design rules:
 *   • Zero knowledge of innings numbers, API routes, or UI layout.
 *   • All state is owned by the caller; this hook reads + mutates via setters.
 *   • Every ball type is fully reversible via handleUndo.
 *   • Free hit state (pendingFreeHit) is stored on each ball for accurate undo.
 *   • Retired hurt does NOT count as a wicket (Law 45 / ICC rules).
 *   • Penalty runs (Law 41.17) are supported on any ball type.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Notes for future maintainers
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * useCallback instability
 * ───────────────────────
 *   All handlers capture ballHistory, batsmenOnCrease, bowlersInTable, etc.,
 *   which change on every delivery → new references every ball.  The useRef
 *   or useReducer patterns described below give truly stable references.
 *
 *   Option A — useRef for snapshot reads (minimal change)
 *     const snap = useRef({});
 *     snap.current = { ballHistory, batsmenOnCrease, ... };
 *     const handleRuns = useCallback((runs) => {
 *       const { ballHistory } = snap.current;
 *       ...
 *     }, [appendBall, ...stableSetters]);
 *
 *   Option B — useReducer in the parent (recommended for next refactor)
 *     Move all scoring state into a single reducer.  Handlers become
 *     trivial dispatch calls, eliminating all setter-plumbing.
 *
 * Atomicity
 * ─────────
 *   Each handler fires multiple setState calls.  React 18 batches these inside
 *   event handlers, but a single useReducer (Option B) gives one guaranteed
 *   atomic update per action and simplifies time-travel debugging.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback } from 'react';

import { DASH } from '@/lib/constants/ui';
import { isLegalDelivery } from '@/lib/utils/cricketRules';
import { wouldInningsEndAfterBall } from '@/lib/utils/scoringUtils';

// ─── Internal helpers ─────────────────────────────────────────────────────────

const LEGAL_DELIVERIES_PER_OVER = 6;

/**
 * Count legal deliveries already bowled in the CURRENT (incomplete) over.
 * Walks backward through history; resets the counter every 6 legal balls seen
 * so we only return the incomplete-over remainder, not a cumulative total.
 *
 * @param {object[]} ballHistory
 * @returns {number} 0–5
 */
function legalDeliveriesInCurrentOver(ballHistory) {
  let count = 0;
  for (let i = (ballHistory ?? []).length - 1; i >= 0; i--) {
    if (isLegalDelivery(ballHistory[i].type)) {
      count++;
      if (count === LEGAL_DELIVERIES_PER_OVER) count = 0;
    }
  }
  return count;
}

/** True when the next legal delivery will complete the current over. */
function isLastBallOfOver(ballHistory) {
  return (
    legalDeliveriesInCurrentOver(ballHistory) === LEGAL_DELIVERIES_PER_OVER - 1
  );
}

/**
 * Compute whether the NEXT delivery should be a free hit.
 * Inlined here (without importing the util) because we know the ball type:
 *   NB                       → next is free hit
 *   WD on existing free hit  → carry over free hit
 *   Anything else            → clear free hit
 */
function nextPendingFreeHit(ballType, currentPendingFreeHit) {
  if (ballType === 'nb') return true;
  if (currentPendingFreeHit && ballType === 'wd') return true;
  return false;
}

/**
 * Append a ball to ball history and optionally sync to the API.
 * When the API responds, patches the last ball with the server-assigned id
 * and any enriched fields (e.g. dismissal_type_label).
 */
function appendBallImpl(setBallHistory, syncBallToApi, ball) {
  setBallHistory((prev) => [...prev, ball]);
  if (!syncBallToApi) return;
  syncBallToApi(ball, (data) => {
    if (!data) return;
    setBallHistory((prev) => {
      const copy = [...prev];
      if (copy.length === 0) return prev;
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = {
        ...last,
        id: data.id ?? last.id,
        ...(last.type === 'out' && data.dismissal_type_label != null
          ? { dismissalLabel: data.dismissal_type_label }
          : {}),
      };
      return copy;
    });
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}   p
 *
 * — Innings state (read + write) —
 * @param {object[]} p.ballHistory
 * @param {Function} p.setBallHistory
 * @param {object[]} p.batsmenOnCrease       Max 2. Each must carry:
 *                                           { id, runs, balls, fours, sixes,
 *                                             partnerRunsAtStart, partnerBallsAtStart }
 * @param {Function} p.setBatsmenOnCrease
 * @param {object[]} p.bowlersInTable
 * @param {Function} p.setBowlersInTable
 * @param {number}   p.strikerIndex          0 or 1
 * @param {Function} p.setStrikerIndex
 * @param {number}   p.currentBowlerIndex
 * @param {Function} p.setCurrentBowlerIndex
 * @param {object}   p.currentPartnership    { runs, balls }
 * @param {Function} p.setCurrentPartnership
 * @param {Function} p.setCompletedPartnerships
 * @param {boolean}  p.pendingFreeHit        Is the NEXT delivery a free hit?
 * @param {Function} p.setPendingFreeHit
 * @param {object[]} p.retiredBatsmen        Batsmen who retired hurt (not wickets).
 * @param {Function} p.setRetiredBatsmen
 *
 * — UI open/close callbacks —
 * @param {Function} p.setAddBowlerOpen      Called true at end of every over.
 * @param {Function} p.setOutReasonModalOpen Called false after wicket confirmed.
 * @param {Function} p.setPendingDismissal   Called null after wicket confirmed.
 * @param {Function} p.setFielderPickerOpen  Called false after wicket confirmed.
 *
 * — API sync —
 * @param {Function} [p.syncBallToApi]       (ball, onIdAssigned) => void
 * @param {Function} [p.syncUndoToApi]       (ballId) => void
 *
 * — Match config —
 * @param {number|string|undefined} [p.matchOvers]
 * @param {number|undefined} [p.playersPerSide]
 * @param {number|undefined} [p.targetScore]
 * @param {boolean} [p.matchComplete]        When true, never open the bowler dialog.
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
  pendingFreeHit,
  setPendingFreeHit,
  retiredBatsmen,
  setRetiredBatsmen,
  setAddBowlerOpen,
  setOutReasonModalOpen,
  setPendingDismissal,
  setFielderPickerOpen,
  syncBallToApi,
  syncUndoToApi,
  matchOvers,
  playersPerSide,
  targetScore,
  matchComplete = false,
}) {
  // appendBall is stable when setBallHistory + syncBallToApi are stable.
  const appendBall = useCallback(
    (ball) => appendBallImpl(setBallHistory, syncBallToApi, ball),
    [setBallHistory, syncBallToApi],
  );

  // ── handleRuns ───────────────────────────────────────────────────────────────

  /**
   * Records a legal run-scoring delivery.
   *
   * @param {number}      runs
   * @param {string|null} [shotDirection]  Optional shot-zone ID from stadium diagram.
   * @param {number}      [penaltyRuns]    Penalty runs (Law 41.17) awarded this delivery.
   */
  const handleRuns = useCallback(
    function handleRuns(runs, shotDirection = null, penaltyRuns = 0) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      const striker = batsmenOnCrease[strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];
      const overDone = isLastBallOfOver(ballHistory);
      const hasTwoBowlers = bowlersInTable.length >= 2;

      const ball = {
        type: 'runs',
        runs,
        penaltyRuns: penaltyRuns || 0,
        strikerId: striker?.id,
        bowlerId: bowler?.id,
        isFreeHit: pendingFreeHit,
        wasFreeHit: pendingFreeHit, // snapshot for undo
        ...(shotDirection ? { shotDirection } : {}),
      };

      const inningsEnds = wouldInningsEndAfterBall({
        ballHistory,
        pendingBall: ball,
        maxOvers: matchOvers,
        playersPerSide,
        targetScore,
      });

      appendBall(ball);

      // Batsman
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

      // Bowler (penalty runs also credited against the bowler)
      setBowlersInTable((prev) =>
        prev.map((b) =>
          b.id !== bowler?.id
            ? b
            : {
                ...b,
                runs: b.runs + runs + penaltyRuns,
                balls: (b.balls ?? 0) + 1,
              },
        ),
      );

      // Partnership
      setCurrentPartnership((p) => ({
        runs: p.runs + runs,
        balls: p.balls + 1,
      }));

      // Strike rotation on odd batting runs
      if (runs % 2 === 1) setStrikerIndex((i) => 1 - i);

      // Over boundary
      if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
      if (overDone && !matchComplete && !inningsEnds) setAddBowlerOpen(true);

      // Free hit: a legal delivery always clears the pending flag
      setPendingFreeHit(nextPendingFreeHit('runs', pendingFreeHit));
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      pendingFreeHit,
      appendBall,
      setBatsmenOnCrease,
      setBowlersInTable,
      setCurrentPartnership,
      setStrikerIndex,
      setCurrentBowlerIndex,
      setAddBowlerOpen,
      setPendingFreeHit,
      matchOvers,
      playersPerSide,
      targetScore,
      matchComplete,
    ],
  );

  // ── handleSpecial ────────────────────────────────────────────────────────────

  /**
   * Records an extra: wide (wd), no-ball (nb), bye, or leg-bye (lb).
   *
   * Over counter rules:
   *   WD / NB → NOT legal; over counter does NOT advance.
   *   BYE / LB → IS legal; over counter advances normally.
   *
   * No-ball: the striker's personal ball count increments (they faced it)
   * even though the delivery is not legal for over-counter purposes.
   *
   * Free hit after NB (Law 21.18):
   *   Every no-ball triggers a free hit on the next delivery.
   *   A wide on a free hit carries the flag forward; any other legal delivery clears it.
   *
   * @param {'wd'|'nb'|'bye'|'lb'} type
   * @param {number} [extraRuns]    Default 1 for wd/nb, 0 for bye/lb.
   * @param {number} [penaltyRuns] Penalty runs (Law 41.17).
   */
  const handleSpecial = useCallback(
    function handleSpecial(type, extraRuns = undefined, penaltyRuns = 0) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      if (!['wd', 'nb', 'bye', 'lb'].includes(type)) {
        console.warn(
          '[useScoringEngine] handleSpecial: unexpected type:',
          type,
        );
        return;
      }

      const striker = batsmenOnCrease[strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];

      // WD / NB: the user enters the batting/overthrow runs on top of the
      // mandatory +1 penalty run.  e.g. NB + 1 batting run = 2 total, NOT 1.
      const extraRun =
        type === 'wd' || type === 'nb'
          ? Math.max(0, Number(extraRuns) || 0) + 1
          : Math.max(0, Number(extraRuns) || 0);

      const legal = isLegalDelivery(type);
      const overDone = legal && isLastBallOfOver(ballHistory);
      const hasTwoBowlers = bowlersInTable.length >= 2;

      const ball = {
        type,
        runs: extraRun,
        penaltyRuns: penaltyRuns || 0,
        bowlerId: bowler?.id,
        strikerId: striker?.id,
        isFreeHit: pendingFreeHit,
        wasFreeHit: pendingFreeHit,
      };

      const inningsEnds = overDone
        ? wouldInningsEndAfterBall({
            ballHistory,
            pendingBall: ball,
            maxOvers: matchOvers,
            playersPerSide,
            targetScore,
          })
        : false;

      appendBall(ball);

      // NB: striker personally faces the ball — ball count goes up
      if (type === 'nb' && striker) {
        setBatsmenOnCrease((prev) =>
          prev.map((b) =>
            b.id === striker.id ? { ...b, balls: b.balls + 1 } : b,
          ),
        );
      }

      // Bowler
      setBowlersInTable((prev) =>
        prev.map((b) =>
          b.id !== bowler?.id
            ? b
            : {
                ...b,
                runs: b.runs + extraRun + penaltyRuns,
                balls: (b.balls ?? 0) + (legal ? 1 : 0),
              },
        ),
      );

      // Partnership
      if (!legal) {
        setCurrentPartnership((p) => ({ ...p, runs: p.runs + extraRun }));
      } else {
        setCurrentPartnership((p) => ({
          runs: p.runs + extraRun,
          balls: p.balls + 1,
        }));
      }

      // Strike rotation: bye/lb with odd run count rotates strike
      if (legal && extraRun % 2 === 1) setStrikerIndex((i) => 1 - i);

      // Over boundary
      if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
      if (overDone && !matchComplete && !inningsEnds) setAddBowlerOpen(true);

      // Free hit state update
      setPendingFreeHit(nextPendingFreeHit(type, pendingFreeHit));
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      pendingFreeHit,
      appendBall,
      setBatsmenOnCrease,
      setBowlersInTable,
      setCurrentPartnership,
      setStrikerIndex,
      setCurrentBowlerIndex,
      setAddBowlerOpen,
      setPendingFreeHit,
      matchOvers,
      playersPerSide,
      targetScore,
      matchComplete,
    ],
  );

  // ── handleOut ────────────────────────────────────────────────────────────────

  /**
   * Records a dismissal (wicket).
   *
   * On a free-hit delivery only run_out, obstructing_the_field, and
   * hit_ball_twice are valid dismissals (Law 21.18).  The UI is responsible
   * for restricting the options shown, but this hook validates and warns.
   *
   * Partnership snapshot is stored on the ball so handleUndo can restore it exactly.
   *
   * After a wicket the striker is removed from the crease and setStrikerIndex(0)
   * is called; the parent should append the new batter at index 0.
   *
   * @param {string}        dismissalType  e.g. 'bowled', 'caught', 'run_out'
   * @param {number|string} [fielderId]    Required for caught / stumped / run_out
   * @param {number}        [penaltyRuns]  Penalty runs (Law 41.17)
   */
  const handleOut = useCallback(
    function handleOut(dismissalType, fielderId = undefined, penaltyRuns = 0) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      // Free-hit dismissal restriction (warn only — UI should already filter)
      const FREE_HIT_VALID = new Set([
        'run_out',
        'obstructing_the_field',
        'hit_ball_twice',
      ]);
      if (pendingFreeHit && !FREE_HIT_VALID.has(dismissalType)) {
        console.warn(
          '[useScoringEngine] Invalid dismissal on free hit:',
          dismissalType,
          '— ignoring.',
        );
        return;
      }

      const striker = batsmenOnCrease[strikerIndex];
      const nonStriker = batsmenOnCrease[1 - strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];
      const overDone = isLastBallOfOver(ballHistory);
      const hasTwoBowlers = bowlersInTable.length >= 2;

      const partnershipSnapshot = {
        runs: currentPartnership?.runs ?? 0,
        balls: currentPartnership?.balls ?? 0,
      };

      const strikerContrib = {
        runs: (striker?.runs ?? 0) - (striker?.partnerRunsAtStart ?? 0),
        balls: (striker?.balls ?? 0) - (striker?.partnerBallsAtStart ?? 0),
      };
      const nonStrikerContrib = {
        runs: (nonStriker?.runs ?? 0) - (nonStriker?.partnerRunsAtStart ?? 0),
        balls:
          (nonStriker?.balls ?? 0) - (nonStriker?.partnerBallsAtStart ?? 0),
      };

      const ball = {
        type: 'out',
        runs: 0,
        penaltyRuns: penaltyRuns || 0,
        striker: { ...striker },
        bowlerId: bowler?.id,
        dismissalType: dismissalType ?? null,
        fielderId: fielderId || undefined,
        isFreeHit: pendingFreeHit,
        wasFreeHit: pendingFreeHit,
        partnershipSnapshot,
      };

      const inningsEnds = wouldInningsEndAfterBall({
        ballHistory,
        pendingBall: ball,
        maxOvers: matchOvers,
        playersPerSide,
        targetScore,
      });

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

      appendBall(ball);

      // Bowler: wicket + legal ball
      setBowlersInTable((prev) =>
        prev.map((b) =>
          b.id !== bowler?.id
            ? b
            : {
                ...b,
                wickets: b.wickets + 1,
                balls: (b.balls ?? 0) + 1,
                runs: b.runs + penaltyRuns,
              },
        ),
      );

      // Remove dismissed batter from crease
      setBatsmenOnCrease((prev) => prev.filter((b) => b.id !== striker?.id));
      setStrikerIndex(0);

      // Over boundary
      if (overDone && hasTwoBowlers) setCurrentBowlerIndex((i) => 1 - i);
      if (overDone && !matchComplete && !inningsEnds) setAddBowlerOpen(true);

      // A wicket is a legal delivery → clear free hit
      setPendingFreeHit(nextPendingFreeHit('out', pendingFreeHit));

      // Close modals
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
      pendingFreeHit,
      appendBall,
      setCompletedPartnerships,
      setCurrentPartnership,
      setBowlersInTable,
      setBatsmenOnCrease,
      setStrikerIndex,
      setCurrentBowlerIndex,
      setAddBowlerOpen,
      setPendingFreeHit,
      setOutReasonModalOpen,
      setPendingDismissal,
      setFielderPickerOpen,
      matchOvers,
      playersPerSide,
      targetScore,
      matchComplete,
    ],
  );

  // ── handleRetiredHurt ────────────────────────────────────────────────────────

  /**
   * Records a batsman retiring hurt (NOT a wicket).
   *
   * The batsman is removed from the crease and added to retiredBatsmen.
   * The bowler does NOT receive a wicket credit.
   * The partnership ends and is recorded as completed.
   * The batsman MAY return to the crease later in the innings.
   *
   * No innings-end check: a retired hurt does not change the wicket count.
   *
   * @param {number} [penaltyRuns]  Penalty runs (Law 41.17) if applicable.
   */
  const handleRetiredHurt = useCallback(
    function handleRetiredHurt(penaltyRuns = 0) {
      if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;

      const striker = batsmenOnCrease[strikerIndex];
      const nonStriker = batsmenOnCrease[1 - strikerIndex];
      const bowler = bowlersInTable[currentBowlerIndex];

      const partnershipSnapshot = {
        runs: currentPartnership?.runs ?? 0,
        balls: currentPartnership?.balls ?? 0,
      };

      const strikerContrib = {
        runs: (striker?.runs ?? 0) - (striker?.partnerRunsAtStart ?? 0),
        balls: (striker?.balls ?? 0) - (striker?.partnerBallsAtStart ?? 0),
      };
      const nonStrikerContrib = {
        runs: (nonStriker?.runs ?? 0) - (nonStriker?.partnerRunsAtStart ?? 0),
        balls:
          (nonStriker?.balls ?? 0) - (nonStriker?.partnerBallsAtStart ?? 0),
      };

      const ball = {
        type: 'retired_hurt',
        runs: 0,
        penaltyRuns: penaltyRuns || 0,
        striker: { ...striker },
        bowlerId: bowler?.id,
        dismissalType: 'retired_hurt',
        isFreeHit: pendingFreeHit,
        wasFreeHit: pendingFreeHit,
        partnershipSnapshot,
      };

      setCompletedPartnerships((prev) => [
        ...prev,
        {
          id: `p-rh-${Date.now()}`,
          batter1: { name: nonStriker?.name ?? DASH, ...nonStrikerContrib },
          batter2: { name: striker?.name ?? DASH, ...strikerContrib },
          runs: partnershipSnapshot.runs,
          balls: partnershipSnapshot.balls,
          retiredHurt: true,
        },
      ]);

      setCurrentPartnership({ runs: 0, balls: 0 });

      appendBall(ball);

      // Add to retired list (not a wicket — may return)
      setRetiredBatsmen((prev) => {
        if (prev.some((b) => String(b.id) === String(striker?.id))) return prev;
        return [...prev, { ...striker }];
      });

      // Remove from crease, new batter will be appended by parent at index 0
      setBatsmenOnCrease((prev) => prev.filter((b) => b.id !== striker?.id));
      setStrikerIndex(0);

      // Penalty runs on bowler if applicable (no wicket)
      if (penaltyRuns > 0) {
        setBowlersInTable((prev) =>
          prev.map((b) =>
            b.id !== bowler?.id ? b : { ...b, runs: b.runs + penaltyRuns },
          ),
        );
      }

      // Retired hurt is NOT a legal delivery for over-counter purposes.
      // Free hit state is unchanged (treat as illegal delivery).
      // (No over-boundary check needed.)
    },
    [
      ballHistory,
      batsmenOnCrease,
      bowlersInTable,
      strikerIndex,
      currentBowlerIndex,
      currentPartnership,
      pendingFreeHit,
      appendBall,
      setCompletedPartnerships,
      setCurrentPartnership,
      setRetiredBatsmen,
      setBatsmenOnCrease,
      setStrikerIndex,
      setBowlersInTable,
    ],
  );

  // ── handleUndo ───────────────────────────────────────────────────────────────

  /**
   * Reverses the most recent ball and all state it affected.
   * Handles: 'runs', 'out', 'retired_hurt', 'wd', 'nb', 'bye', 'lb'.
   */
  const handleUndo = useCallback(
    function handleUndo() {
      const last = ballHistory[ballHistory.length - 1];
      if (!last) return;

      // Fire API delete if ball has been persisted
      if (last.id != null && syncUndoToApi) syncUndoToApi(last.id);
      setBallHistory((prev) => prev.slice(0, -1));

      // Restore free hit state to what it was BEFORE this ball
      setPendingFreeHit(last.wasFreeHit ?? false);

      /** Restore the bowler index to match the ball's bowler. */
      function restoreBowlerIndex(bowlerId) {
        if (bowlerId == null) return;
        const idx = bowlersInTable.findIndex((b) => b.id === bowlerId);
        if (idx >= 0) setCurrentBowlerIndex(idx);
      }

      // ── runs ──────────────────────────────────────────────────────────────
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
                  runs: Math.max(
                    0,
                    b.runs - last.runs - (last.penaltyRuns ?? 0),
                  ),
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
      }

      // ── out (wicket) ──────────────────────────────────────────────────────
      else if (last.type === 'out') {
        if (!last.striker) return;

        setCompletedPartnerships((prev) => prev.slice(0, -1));

        if (last.partnershipSnapshot) {
          setCurrentPartnership(last.partnershipSnapshot);
        } else {
          console.warn(
            '[useScoringEngine] Missing partnershipSnapshot on OUT ball. id:',
            last.id,
          );
          setCurrentPartnership({ runs: 0, balls: 0 });
        }

        // Restore dismissed batter to crease
        setBatsmenOnCrease((prev) => [...prev, last.striker]);

        setBowlersInTable((prev) =>
          prev.map((b) =>
            b.id !== last.bowlerId
              ? b
              : {
                  ...b,
                  wickets: Math.max(0, b.wickets - 1),
                  balls: Math.max(0, (b.balls ?? 0) - 1),
                  runs: Math.max(0, b.runs - (last.penaltyRuns ?? 0)),
                },
          ),
        );

        restoreBowlerIndex(last.bowlerId);
      }

      // ── retired_hurt ──────────────────────────────────────────────────────
      else if (last.type === 'retired_hurt') {
        if (!last.striker) return;

        setCompletedPartnerships((prev) => prev.slice(0, -1));

        if (last.partnershipSnapshot) {
          setCurrentPartnership(last.partnershipSnapshot);
        } else {
          setCurrentPartnership({ runs: 0, balls: 0 });
        }

        // Return batter from retired list to the crease
        setRetiredBatsmen((prev) =>
          prev.filter((b) => String(b.id) !== String(last.striker.id)),
        );
        setBatsmenOnCrease((prev) => [...prev, last.striker]);

        // Reverse penalty runs from bowler if applicable
        if ((last.penaltyRuns ?? 0) > 0) {
          setBowlersInTable((prev) =>
            prev.map((b) =>
              b.id !== last.bowlerId
                ? b
                : { ...b, runs: Math.max(0, b.runs - last.penaltyRuns) },
            ),
          );
        }
      }

      // ── extras: wd / nb / bye / lb ────────────────────────────────────────
      else if (['wd', 'nb', 'bye', 'lb'].includes(last.type)) {
        const legal = isLegalDelivery(last.type);

        // NB: reverse striker ball count (BUG-7 fix carried forward)
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
                  runs: Math.max(
                    0,
                    b.runs - (last.runs ?? 0) - (last.penaltyRuns ?? 0),
                  ),
                  balls: Math.max(0, (b.balls ?? 0) - (legal ? 1 : 0)),
                },
          ),
        );

        if (!legal) {
          // WD / NB: only runs, no ball count
          setCurrentPartnership((p) => ({
            ...p,
            runs: Math.max(0, p.runs - (last.runs ?? 1)),
          }));
        } else {
          // BYE / LB: runs + ball
          const r = last.runs ?? 0;
          setCurrentPartnership((p) => ({
            runs: Math.max(0, p.runs - r),
            balls: Math.max(0, p.balls - 1),
          }));
          if (r % 2 === 1) setStrikerIndex((i) => 1 - i);
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
      setPendingFreeHit,
      setRetiredBatsmen,
      syncUndoToApi,
    ],
  );

  return {
    handleRuns,
    handleSpecial,
    handleOut,
    handleRetiredHurt,
    handleUndo,
  };
}
