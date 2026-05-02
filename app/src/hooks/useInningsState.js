/**
 * useInningsState
 *
 * Encapsulates ALL mutable state for ONE cricket innings.
 * ScoringMatch calls this hook twice (once per innings) to eliminate
 * the 20+ duplicated state variables that existed before.
 *
 * Usage:
 *   const innings1 = useInningsState();
 *   const innings2 = useInningsState();
 *
 *   // Pass whichever is active to ScoringTab:
 *   const active = currentInnings === '1' ? innings1 : innings2;
 *   <ScoringTab {...active} ... />
 *
 * The reset(opts) method lets ScoringMatch hydrate the innings from
 * API data in one atomic call, avoiding mid-render partial states.
 */

import { useState } from 'react';

// ─── Shared constants (also used by ScoringMatch + ScoringTab) ────────────────

export const INITIAL_PARTNERSHIP = { runs: 0, balls: 0 };

/** Returns a blank batsman ready for the crease. */
export const blankBatsman = (p) => ({
  id: p.id,
  name: p.name,
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0,
  partnerRunsAtStart: 0,
  partnerBallsAtStart: 0,
});

/** Returns a blank bowler ready for the live bowler table. */
export const blankBowler = (p) => ({
  id: p.id,
  name: p.name,
  overs: '0',
  maidens: 0,
  runs: 0,
  wickets: 0,
  balls: 0,
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInningsState() {
  const [ballHistory, setBallHistory] = useState([]);
  const [batsmenOnCrease, setBatsmenOnCrease] = useState([]);
  const [bowlersInTable, setBowlersInTable] = useState([]);
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);
  const [currentPartnership, setCurrentPartnership] =
    useState(INITIAL_PARTNERSHIP);
  const [completedPartnerships, setCompletedPartnerships] = useState([]);

  /**
   * Free hit pending flag (Law 21.18).
   * True when the NEXT delivery must be bowled as a free hit.
   * Set after every no-ball; cleared after the next legal delivery.
   * Carried over through wides and subsequent no-balls.
   */
  const [pendingFreeHit, setPendingFreeHit] = useState(false);

  /**
   * Batsmen who have retired hurt.
   * They are removed from the crease but do NOT count as a wicket.
   * They may return later in the innings.
   * Each entry is a full batsman stat object.
   */
  const [retiredBatsmen, setRetiredBatsmen] = useState([]);

  // Batting squad: players from the team that is BATTING in this innings.
  const [battingSquad, setBattingSquad] = useState([]);

  // Bowling squad: players from the team that is BOWLING in this innings.
  const [bowlingSquad, setBowlingSquad] = useState([]);

  /**
   * Resets the entire innings to a known state in ONE call.
   * Pass only the fields you want to override; the rest fall back to empty/zero.
   *
   * This is the ONLY way ScoringMatch should hydrate innings state so that all
   * setState calls are grouped together and React can batch them.
   *
   * @param {object} [opts]
   * @param {object[]} [opts.ballHistory]
   * @param {object[]} [opts.batsmenOnCrease]
   * @param {object[]} [opts.bowlersInTable]
   * @param {number}   [opts.strikerIndex]
   * @param {number}   [opts.currentBowlerIndex]
   * @param {object}   [opts.currentPartnership]
   * @param {object[]} [opts.completedPartnerships]
   * @param {boolean}  [opts.pendingFreeHit]
   * @param {object[]} [opts.retiredBatsmen]
   * @param {object[]} [opts.battingSquad]
   * @param {object[]} [opts.bowlingSquad]
   */
  function reset(opts = {}) {
    setBallHistory(opts.ballHistory ?? []);
    setBatsmenOnCrease(opts.batsmenOnCrease ?? []);
    setBowlersInTable(opts.bowlersInTable ?? []);
    setStrikerIndex(opts.strikerIndex ?? 0);
    setCurrentBowlerIndex(opts.currentBowlerIndex ?? 0);
    setCurrentPartnership(opts.currentPartnership ?? INITIAL_PARTNERSHIP);
    setCompletedPartnerships(opts.completedPartnerships ?? []);
    setPendingFreeHit(opts.pendingFreeHit ?? false);
    setRetiredBatsmen(opts.retiredBatsmen ?? []);
    if (opts.battingSquad !== undefined) setBattingSquad(opts.battingSquad);
    if (opts.bowlingSquad !== undefined) setBowlingSquad(opts.bowlingSquad);
  }

  return {
    // ── State values ──────────────────────────────────────────────────────────
    ballHistory,
    batsmenOnCrease,
    bowlersInTable,
    strikerIndex,
    currentBowlerIndex,
    currentPartnership,
    completedPartnerships,
    pendingFreeHit,
    retiredBatsmen,
    battingSquad,
    bowlingSquad,

    // ── Setters (stable references from useState) ─────────────────────────────
    setBallHistory,
    setBatsmenOnCrease,
    setBowlersInTable,
    setStrikerIndex,
    setCurrentBowlerIndex,
    setCurrentPartnership,
    setCompletedPartnerships,
    setPendingFreeHit,
    setRetiredBatsmen,
    setBattingSquad,
    setBowlingSquad,

    // ── Batch reset ───────────────────────────────────────────────────────────
    reset,
  };
}
