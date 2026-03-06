/**
 * Scoring tab – live scoring view: team/innings, score, stats, batsmen and bowlers tables.
 * Uses the same table UI as scorecard flow (statusDetailsTabs/ScorecardTab, LiveTab).
 */

import { useState, useMemo, useRef, useEffect } from 'react';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import { getMockPlayers, toSquadWithRole } from '../matchConfig';
import { getRunsFromBall, ballsToOvers } from '../scoringUtils';
import { MatchStatsRow } from '../MatchStatsRow';
import { Button } from '@/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogContentProfile,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormField, formFieldLabelEditClass } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { ShotAreaDialog } from '../ShotAreaDialog';

// ─── Constants ─────────────────────────────────────────────────────────────

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';
const DASH = '—';

const RUN_BUTTON_BG = ['#10100F', '#171715', '#1F1F1C', '#282824', '#31312C', '#3B3B35', '#46463F'];

const DISMISSAL_REASONS = [
  'Bowled',
  'Caught',
  'Stumped',
  'LBW',
  'Run Out',
  'Over the Fence',
  'Mankad',
  'Retired',
  'Hit Wicket',
  'Hit the Ball Twice',
  'Timed Out',
  'One Hand One Bounce',
  'Obstructing the Field',
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function strikeRate(runs, balls) {
  if (!balls) return '0.0';
  return ((Number(runs) / Number(balls)) * 100).toFixed(1);
}

function economyRate(runs, overs) {
  if (!overs) return '0.0';
  return (Number(runs) / Number(overs)).toFixed(1);
}

function getBallDisplay(ball) {
  if (!ball) return { label: '•', variant: 'dot' };
  if (ball.type === 'runs') {
    const r = ball.runs ?? 0;
    if (r === 0) return { label: '•', variant: 'dot' };
    if (r === 4) return { label: '4', variant: 'four' };
    if (r === 6) return { label: '6', variant: 'six' };
    return { label: String(r), variant: 'runs' };
  }
  if (ball.type === 'out') return { label: 'W', variant: 'wicket' };
  if (ball.type === 'wd') return { label: 'WD', variant: 'extra' };
  if (ball.type === 'nb') return { label: 'NB', variant: 'extra' };
  if (ball.type === 'bye') return { label: 'B', variant: 'extra' };
  if (ball.type === 'lb') return { label: 'LB', variant: 'extra' };
  return { label: '•', variant: 'dot' };
}

function overOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ScoringTab({
  match,
  ballHistory = [],
  setBallHistory,
  batsmenOnCrease = [],
  setBatsmenOnCrease,
  squad: squadProp,
  setSquad,
  bowlerSquad: bowlerSquadProp,
  setBowlerSquad,
  bowlersInTable: bowlersInTableProp,
  setBowlersInTable,
  strikerIndex: strikerIndexProp,
  setStrikerIndex,
  currentBowlerIndex: currentBowlerIndexProp,
  setCurrentBowlerIndex,
  liveScore: liveScoreProp,
  partnership: partnershipProp,
  currentPartnership,
  setCurrentPartnership,
  completedPartnerships,
  setCompletedPartnerships,
}) {
  // ─── Match & squads (base data) ───────────────────────────────────────────

  const teamA = match?.teamA ?? { name: '' };
  const teamB = match?.teamB ?? { name: '' };

  const battingSquad = useMemo(
    () =>
      toSquadWithRole(
        teamA?.players?.length ? teamA.players : getMockPlayers('A'),
        'bench',
      ),
    [teamA?.players],
  );
  const bowlingSquad = useMemo(
    () =>
      toSquadWithRole(
        teamB?.players?.length ? teamB.players : getMockPlayers('B'),
        'bench',
      ),
    [teamB?.players],
  );

  // ─── UI state ─────────────────────────────────────────────────────────────

  const [addBatsmanOpen, setAddBatsmanOpen] = useState(false);
  const [addBatsmanView, setAddBatsmanView] = useState('select');
  const [newBatsmanName, setNewBatsmanName] = useState('');
  const [addBowlerOpen, setAddBowlerOpen] = useState(false);
  const [addBowlerView, setAddBowlerView] = useState('select');
  const [newBowlerName, setNewBowlerName] = useState('');
  const [outReasonModalOpen, setOutReasonModalOpen] = useState(false);
  const [customScoreDialogOpen, setCustomScoreDialogOpen] = useState(false);
  const [customScoreInput, setCustomScoreInput] = useState('');
  const [shotAreaDialogOpen, setShotAreaDialogOpen] = useState(false);
  const [pendingRunsForShot, setPendingRunsForShot] = useState(null);

  // ─── Lifted state with fallbacks (persists across tab switch) ──────────────

  const [squadFallback, setSquadFallback] = useState(() =>
    battingSquad.map((p) => ({ ...p, role: p.role === 'playing' ? 'playing' : 'bench' })),
  );
  const squad = squadProp ?? squadFallback;
  const setSquadState = setSquad ?? setSquadFallback;

  const [bowlerSquadFallback, setBowlerSquadFallback] = useState(() =>
    bowlingSquad.map((p) => ({ ...p, role: p.role === 'playing' ? 'playing' : 'bench' })),
  );
  const bowlerSquad = bowlerSquadProp ?? bowlerSquadFallback;
  const setBowlerSquadState = setBowlerSquad ?? setBowlerSquadFallback;

  const [bowlersInTableFallback, setBowlersInTableFallback] = useState([]);
  const bowlersInTable = bowlersInTableProp ?? bowlersInTableFallback;
  const setBowlersInTableState = setBowlersInTable ?? setBowlersInTableFallback;

  const strikerIndex = strikerIndexProp ?? 0;
  const setStrikerIndexState = setStrikerIndex ?? (() => {});
  const currentBowlerIndex = currentBowlerIndexProp ?? 0;
  const setCurrentBowlerIndexState = setCurrentBowlerIndex ?? (() => {});

  // ─── Derived data ─────────────────────────────────────────────────────────

  /** Overs derived from ball history. Each over = 6 valid deliveries (WD/NB do not count).
   *  Display shows all balls in that over (6 valid + any WD/NB), so an over can show 6–N chips.
   */
  const oversFromBalls = useMemo(() => {
    const list = [];
    let currentOver = [];
    let validCount = 0;
    const VALID_DELIVERIES_PER_OVER = 6;

    for (const ball of ballHistory) {
      currentOver.push(ball);
      const isValidDelivery = ball.type !== 'wd' && ball.type !== 'nb';
      if (isValidDelivery) validCount += 1;

      if (validCount === VALID_DELIVERIES_PER_OVER) {
        const overIndex = list.length + 1;
        const runs = currentOver.reduce((sum, b) => sum + getRunsFromBall(b), 0);
        list.push({ overIndex, runs, balls: currentOver });
        currentOver = [];
        validCount = 0;
      }
    }

    if (currentOver.length > 0) {
      const overIndex = list.length + 1;
      const runs = currentOver.reduce((sum, b) => sum + getRunsFromBall(b), 0);
      list.push({ overIndex, runs, balls: currentOver });
    }

    return list;
  }, [ballHistory]);

  const liveScore = liveScoreProp ?? { totalRuns: 0, totalWickets: 0, oversDisplay: '0', maxOvers: 20, extras: 0, crr: '0.0' };
  const partnership = partnershipProp ?? { runs: 0, balls: 0 };

  const overStatsScrollRef = useRef(null);

  /** Auto-scroll over-per-ball strip to latest over/ball when new delivery is recorded. */
  useEffect(() => {
    const el = overStatsScrollRef.current;
    if (!el || ballHistory.length === 0) return;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [ballHistory.length]);

  // ─── Batsman dialog handlers ──────────────────────────────────────────────

  const openAddBatsmanDialog = () => {
    setAddBatsmanView('select');
    setAddBatsmanOpen(true);
  };

  const closeAddBatsmanDialog = () => {
    setAddBatsmanOpen(false);
    setNewBatsmanName('');
  };

  const setBatsmanRole = (id, role) => {
    setSquadState((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );
  };

  /** Add a playing player to the crease (max 2). Closes dialog when second player is added.
   *  When the second batsman joins (either at innings start or after a wicket), a new
   *  partnership begins: stamp each batsman's current runs/balls as "partnerStartRuns/Balls"
   *  so we can later compute only the runs scored *within* this stand.
   */
  const addBatsmanToCrease = (player) => {
    if (batsmenOnCrease.length >= 2) return;
    const willBeSecond = batsmenOnCrease.length === 1;
    setBatsmenOnCrease((prev) => {
      const newBatsman = {
        id: player.id,
        name: player.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        partnerRunsAtStart: 0,
        partnerBallsAtStart: 0,
      };
      if (willBeSecond) {
        // Stamp existing batsman's current runs/balls as the partnership start baseline
        return [
          ...prev.map((b) => ({
            ...b,
            partnerRunsAtStart: b.runs,
            partnerBallsAtStart: b.balls,
          })),
          newBatsman,
        ];
      }
      return [...prev, newBatsman];
    });
    if (willBeSecond) {
      // New pair – reset the running partnership counter
      if (setCurrentPartnership) setCurrentPartnership({ runs: 0, balls: 0 });
      setAddBatsmanOpen(false);
    }
  };

  // ─── Batsman selection (derived) ─────────────────────────────────────────

  /** Complete list for Select Batsman dialog; no filter so all players are shown. */
  const batsmanDialogList = squad;
  const canAddMoreBatsmen = batsmenOnCrease.length < 2;

  /** Whether this player has batted this innings: on crease now or dismissed (out in ballHistory). */
  const isPlayerBattingOrOut = (playerId) =>
    batsmenOnCrease.some((b) => b.id === playerId) ||
    (ballHistory || []).some((b) => b.type === 'out' && b.striker?.id === playerId);

  /** Batting stats for dialog: from crease if on crease, else from their 'out' ball if dismissed. */
  const getBatsmanDisplayStats = (playerId) => {
    const onCrease = batsmenOnCrease.find((b) => b.id === playerId);
    if (onCrease) {
      const runs = onCrease.runs ?? 0;
      const balls = onCrease.balls ?? 0;
      const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
      return {
        runs,
        balls,
        fours: onCrease.fours ?? 0,
        sixes: onCrease.sixes ?? 0,
        strikeRate: sr,
      };
    }
    const outBall = (ballHistory || []).find((b) => b.type === 'out' && b.striker?.id === playerId);
    if (outBall?.striker) {
      const s = outBall.striker;
      const runs = s.runs ?? 0;
      const balls = s.balls ?? 0;
      const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
      return {
        runs,
        balls,
        fours: s.fours ?? 0,
        sixes: s.sixes ?? 0,
        strikeRate: sr,
      };
    }
    return null;
  };

  const goToCreateBatsman = () => {
    setNewBatsmanName('');
    setAddBatsmanView('create');
  };

  const handleAddNewBatsman = () => {
    const name = newBatsmanName.trim();
    if (!name) return;
    const newPlayer = { id: `new-${Date.now()}`, name, role: 'playing' };
    setSquadState((prev) => [...prev, newPlayer]);
    setNewBatsmanName('');
    setAddBatsmanView('select');
  };

  // ─── Bowler dialog handlers ───────────────────────────────────────────────

  const openAddBowlerDialog = () => {
    setAddBowlerView('select');
    setAddBowlerOpen(true);
  };

  const closeAddBowlerDialog = () => {
    setAddBowlerOpen(false);
    setNewBowlerName('');
  };

  const setBowlerRole = (id, role) => {
    setBowlerSquadState((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );
  };

  /** Add a playing bowler to the table (max 2). Closes dialog when second bowler is added. */
  const addBowlerToTable = (player) => {
    if (bowlersInTable.length >= 2) return;
    const willBeSecond = bowlersInTable.length === 1;
    setBowlersInTableState((prev) => [
      ...prev,
      {
        id: player.id,
        name: player.name,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        balls: 0,
      },
    ]);
    if (willBeSecond) setAddBowlerOpen(false);
  };

  // ─── Bowler selection (derived) ───────────────────────────────────────────

  const availableForBowlerSelection = bowlerSquad.filter(
    (p) => !bowlersInTable.some((b) => b.id === p.id),
  );
  const canAddMoreBowlers = bowlersInTable.length < 2;

  const goToCreateBowler = () => {
    setNewBowlerName('');
    setAddBowlerView('create');
  };

  const handleAddNewBowler = () => {
    const name = newBowlerName.trim();
    if (!name) return;
    const newPlayer = { id: `new-bowl-${Date.now()}`, name, role: 'playing' };
    setBowlerSquadState((prev) => [...prev, newPlayer]);
    setNewBowlerName('');
    setAddBowlerView('select');
  };

  // ─── Scoring handlers (runs, extras, out, undo) ───────────────────────────

  /** Record a run-scoring ball: update striker, bowler, and current partnership.
   *  @param {number} runs
   *  @param {string} [shotDirection] - optional zone id from SHOT_DIRECTION_ZONES (when selected from dialog)
   */
  const handleRuns = (runs, shotDirection = null) => {
    if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;
    const striker = batsmenOnCrease[strikerIndex];
    const bowler = bowlersInTable[currentBowlerIndex];
    const currentBalls = bowler?.balls ?? 0;
    const newBalls = currentBalls + 1;
    const overComplete = newBalls > 0 && newBalls % 6 === 0;
    const hasTwoBowlers = bowlersInTable.length === 2;

    setBallHistory((prev) => [
      ...prev,
      { type: 'runs', runs, strikerId: striker?.id, bowlerId: bowler?.id, shotDirection: shotDirection ?? undefined },
    ]);
    setBatsmenOnCrease((prev) =>
      prev.map((b) =>
        b.id === striker?.id
          ? {
              ...b,
              runs: b.runs + runs,
              balls: b.balls + 1,
              fours: b.fours + (runs === 4 ? 1 : 0),
              sixes: b.sixes + (runs === 6 ? 1 : 0),
            }
          : b,
      ),
    );
    setBowlersInTableState((prev) =>
      prev.map((b) => (b.id === bowler?.id ? { ...b, runs: b.runs + runs, balls: (b.balls ?? 0) + 1 } : b)),
    );
    // Partnership: count batting runs + 1 legal ball
    if (setCurrentPartnership && batsmenOnCrease.length === 2) {
      setCurrentPartnership((p) => ({ runs: p.runs + runs, balls: p.balls + 1 }));
    }
    if (runs % 2 === 1) setStrikerIndexState((i) => (i === 0 ? 1 : 0));
    if (overComplete && hasTwoBowlers) setCurrentBowlerIndexState((i) => 1 - i);
  };

  const openCustomScoreDialog = () => {
    setCustomScoreInput('');
    setCustomScoreDialogOpen(true);
  };

  const closeCustomScoreDialog = () => {
    setCustomScoreDialogOpen(false);
    setCustomScoreInput('');
  };

  /** Open shot-area dialog for run buttons 1–6; 0 still scores immediately. */
  const openShotAreaDialog = (runs) => {
    setPendingRunsForShot(runs);
    setShotAreaDialogOpen(true);
  };

  const closeShotAreaDialog = () => {
    setShotAreaDialogOpen(false);
    setPendingRunsForShot(null);
  };

  const handleShotDirectionSelect = (zoneId) => {
    if (pendingRunsForShot != null) {
      handleRuns(pendingRunsForShot, zoneId);
    }
    closeShotAreaDialog();
  };

  const handleCustomScoreDone = () => {
    const n = parseInt(customScoreInput.trim(), 10);
    if (Number.isNaN(n) || n < 0 || n > 99) return;
    handleRuns(n);
    closeCustomScoreDialog();
  };

  /** Record special/extra: wide, no-ball, bye, leg bye.
   *  Partnership rules:
   *    WD  – adds 1 run to partnership, NOT a legal ball (no +ball)
   *    NB  – adds 1 run to partnership, NOT a legal ball (no +ball)
   *    BYE – adds 1 legal ball to partnership; runs = 0 in our system
   *    LB  – same as BYE
   */
  const handleSpecial = (type) => {
    if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;
    const bowler = bowlersInTable[currentBowlerIndex];
    const extraRun = type === 'wd' || type === 'nb' ? 1 : 0;
    const isLegalBall = type === 'bye' || type === 'lb';
    const addsBall = isLegalBall; // WD and NB don't advance the over or partnership balls
    const currentBalls = bowler?.balls ?? 0;
    const newBalls = addsBall ? currentBalls + 1 : currentBalls;
    const overComplete = addsBall && newBalls > 0 && newBalls % 6 === 0;
    const hasTwoBowlers = bowlersInTable.length === 2;

    setBallHistory((prev) => [...prev, { type, runs: extraRun, bowlerId: bowler?.id }]);
    if (type === 'nb' && batsmenOnCrease[strikerIndex]) {
      setBatsmenOnCrease((prev) =>
        prev.map((b) => (b.id === batsmenOnCrease[strikerIndex]?.id ? { ...b, balls: b.balls + 1 } : b)),
      );
    }
    setBowlersInTableState((prev) =>
      prev.map((b) =>
        b.id === bowler?.id
          ? { ...b, runs: b.runs + extraRun, balls: (b.balls ?? 0) + (addsBall ? 1 : 0) }
          : b,
      ),
    );
    // Partnership: WD/NB add 1 extra run; BYE/LB add 1 legal ball (0 credited runs)
    if (setCurrentPartnership && batsmenOnCrease.length === 2) {
      if (type === 'wd' || type === 'nb') {
        setCurrentPartnership((p) => ({ ...p, runs: p.runs + 1 }));
      } else if (type === 'bye' || type === 'lb') {
        setCurrentPartnership((p) => ({ ...p, balls: p.balls + 1 }));
      }
    }
    if (overComplete && hasTwoBowlers) setCurrentBowlerIndexState((i) => 1 - i);
  };

  /** Record wicket (OUT). Removes striker from crease. Records completed partnership before removing.
   *
   *  Individual contributions = batsman.runs - batsman.partnerRunsAtStart (only runs in this stand).
   *  Total partnership runs = currentPartnership.runs (includes extras like WD/NB).
   *  partnershipSnapshot saved in ballHistory so UNDO can restore currentPartnership exactly.
   */
  const handleOut = (dismissalType) => {
    if (batsmenOnCrease.length < 2 || bowlersInTable.length === 0) return;
    const striker = batsmenOnCrease[strikerIndex];
    const nonStrikerIndex = 1 - strikerIndex;
    const nonStriker = batsmenOnCrease[nonStrikerIndex];
    const bowler = bowlersInTable[currentBowlerIndex];
    const currentBalls = bowler?.balls ?? 0;
    const newBalls = currentBalls + 1;
    const overComplete = newBalls > 0 && newBalls % 6 === 0;
    const hasTwoBowlers = bowlersInTable.length === 2;

    // Individual runs in THIS stand (innings runs minus what they had when this partnership began)
    const strikerPartnerRuns = (striker?.runs ?? 0) - (striker?.partnerRunsAtStart ?? 0);
    const strikerPartnerBalls = (striker?.balls ?? 0) - (striker?.partnerBallsAtStart ?? 0);
    const nonStrikerPartnerRuns = (nonStriker?.runs ?? 0) - (nonStriker?.partnerRunsAtStart ?? 0);
    const nonStrikerPartnerBalls = (nonStriker?.balls ?? 0) - (nonStriker?.partnerBallsAtStart ?? 0);

    // Snapshot of the partnership counter so UNDO can restore it
    const snapshot = currentPartnership ?? { runs: 0, balls: 0 };

    if (batsmenOnCrease.length === 2 && setCompletedPartnerships) {
      setCompletedPartnerships((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          batter1: {
            name: nonStriker?.name ?? '—',
            runs: nonStrikerPartnerRuns,
            balls: nonStrikerPartnerBalls,
          },
          batter2: {
            name: striker?.name ?? '—',
            runs: strikerPartnerRuns,
            balls: strikerPartnerBalls,
          },
          runs: snapshot.runs,
          balls: snapshot.balls,
        },
      ]);
    }

    // Reset partnership counter – starts fresh for next pair
    if (setCurrentPartnership) setCurrentPartnership({ runs: 0, balls: 0 });

    setBallHistory((prev) => [
      ...prev,
      {
        type: 'out',
        striker: { ...striker },
        bowlerId: bowler?.id,
        dismissalType: dismissalType ?? null,
        partnershipSnapshot: snapshot,
      },
    ]);
    setBowlersInTableState((prev) =>
      prev.map((b) => (b.id === bowler?.id ? { ...b, wickets: b.wickets + 1, balls: (b.balls ?? 0) + 1 } : b)),
    );
    setBatsmenOnCrease((prev) => prev.filter((b) => b.id !== striker?.id));
    setStrikerIndexState(0);
    if (overComplete && hasTwoBowlers) setCurrentBowlerIndexState((i) => 1 - i);
    setOutReasonModalOpen(false);
  };

  /** Undo last ball from history – reverses currentPartnership alongside batsmen/bowler stats. */
  const handleUndo = () => {
    const last = ballHistory[ballHistory.length - 1];
    if (!last) return;
    setBallHistory((prev) => prev.slice(0, -1));
    if (last.type === 'runs' && last.strikerId != null) {
      setBatsmenOnCrease((prev) =>
        prev.map((b) =>
          b.id === last.strikerId
            ? {
                ...b,
                runs: Math.max(0, b.runs - last.runs),
                balls: Math.max(0, b.balls - 1),
                fours: last.runs === 4 ? Math.max(0, b.fours - 1) : b.fours,
                sixes: last.runs === 6 ? Math.max(0, b.sixes - 1) : b.sixes,
              }
            : b,
        ),
      );
      setBowlersInTableState((prev) =>
        prev.map((b) => (b.id === last.bowlerId ? { ...b, runs: Math.max(0, b.runs - last.runs), balls: Math.max(0, (b.balls ?? 0) - 1) } : b)),
      );
      // Undo partnership: subtract runs scored and 1 legal ball
      if (setCurrentPartnership) {
        setCurrentPartnership((p) => ({
          runs: Math.max(0, p.runs - last.runs),
          balls: Math.max(0, p.balls - 1),
        }));
      }
      if (last.runs % 2 === 1) setStrikerIndexState((i) => (i === 0 ? 1 : 0));
      if (last.bowlerId != null) {
        const idx = bowlersInTable.findIndex((b) => b.id === last.bowlerId);
        if (idx >= 0) setCurrentBowlerIndexState(idx);
      }
    } else if (last.type === 'out' && last.striker) {
      // Restore the completed-partnership list and the partnership counter from the saved snapshot
      if (setCompletedPartnerships) setCompletedPartnerships((prev) => prev.slice(0, -1));
      if (setCurrentPartnership && last.partnershipSnapshot) {
        setCurrentPartnership(last.partnershipSnapshot);
      }
      setBatsmenOnCrease((prev) => [...prev, last.striker]);
      setBowlersInTableState((prev) =>
        prev.map((b) => (b.id === last.bowlerId ? { ...b, wickets: Math.max(0, b.wickets - 1), balls: Math.max(0, (b.balls ?? 0) - 1) } : b)),
      );
      if (last.bowlerId != null) {
        const idx = bowlersInTable.findIndex((b) => b.id === last.bowlerId);
        if (idx >= 0) setCurrentBowlerIndexState(idx);
      }
    } else if (last.type === 'wd' || last.type === 'nb' || last.type === 'bye' || last.type === 'lb') {
      setBowlersInTableState((prev) =>
        prev.map((b) => (b.id === last.bowlerId ? { ...b, runs: Math.max(0, b.runs - (last.runs || 0)), balls: Math.max(0, (b.balls ?? 0) - 1) } : b)),
      );
      // Undo partnership counter: WD/NB added 1 run; BYE/LB added 1 ball
      if (setCurrentPartnership) {
        if (last.type === 'wd' || last.type === 'nb') {
          setCurrentPartnership((p) => ({ ...p, runs: Math.max(0, p.runs - 1) }));
        } else {
          setCurrentPartnership((p) => ({ ...p, balls: Math.max(0, p.balls - 1) }));
        }
      }
      if (last.bowlerId != null) {
        const idx = bowlersInTable.findIndex((b) => b.id === last.bowlerId);
        if (idx >= 0) setCurrentBowlerIndexState(idx);
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Team name & innings – centered */}
      <div className="flex items-center justify-center gap-2">
        <img
          src={teamMatchIcon}
          alt=""
          className="h-8 w-8 shrink-0"
          aria-hidden
        />
        <span className="text-[16px] font-bold uppercase tracking-wide text-white">
          {teamA.name || 'Team A'}
        </span>
        <span className="text-[13px] text-[#DA9811]">
          1st Innings
        </span>
      </div>

      {/* Score box – live score above tables */}
      <div className="rounded-[17px] max-w-fit m-auto text-center bg-[#141412] px-6 py-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[36px] font-bold leading-none text-white">
            {liveScore.totalRuns}-{liveScore.totalWickets}
          </span>
          <span className="text-[16px] font-bold text-white/90">
            ({liveScore.oversDisplay} / {liveScore.maxOvers})
          </span>
        </div>
      </div>

      {/* Match stats row – single bar with 1px gradient separators */}
      <MatchStatsRow
        extras={liveScore.extras}
        oversDisplay={liveScore.oversDisplay}
        maxOvers={liveScore.maxOvers}
        crr={liveScore.crr}
        partnershipRuns={partnership.runs}
        partnershipBalls={partnership.balls}
      />

      {/* Batsman table – max 2 batsmen on crease; R = runs, B = balls, 4s, 6s, SR */}
      <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
              >
                Batsman
              </th>
              {['R', 'B', '4s', '6s', 'SR'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} w-[2rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1].map((index) => {
              const batsman = batsmenOnCrease[index];
              const isStriker = index === strikerIndex && batsman;
              return (
                <tr
                  key={index}
                  role={batsman ? 'button' : undefined}
                  tabIndex={batsman ? 0 : undefined}
                  onClick={() => batsman && setStrikerIndexState(index)}
                  onKeyDown={(e) => {
                    if (batsman && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setStrikerIndexState(index);
                    }
                  }}
                  className={`${batsman ? 'cursor-pointer transition-opacity active:opacity-90' : ''}`}
                >
                  <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
                    <span className="flex items-center gap-2">
                      <span className={`text-[12px] font-medium ${isStriker ? 'text-[#DA9811]' : 'text-white'}`}>
                        {batsman ? batsman.name : DASH}
                      </span>
                      {isStriker && (
                        <span
                          className="scoring-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                          aria-label="On strike"
                        />
                      )}
                    </span>
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {batsman ? batsman.runs : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {batsman ? batsman.balls : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {batsman ? batsman.fours : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {batsman ? batsman.sixes : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {batsman ? strikeRate(batsman.runs, batsman.balls) : DASH}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {canAddMoreBatsmen && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex min-h-[5rem] items-center justify-center"
            aria-hidden
          >
            <Button
              type="button"
              variant="dark"
              size="lg"
              className="pointer-events-auto flex flex-col items-center gap-1.5"
              aria-label="Add Batsman"
              onClick={openAddBatsmanDialog}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
                Add Batsman
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Bowler table – max 2 bowlers; O, M, R, W, ECON */}
      <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
              >
                Bowler
              </th>
              {['O', 'M', 'R', 'W', 'ECON'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} ${h === 'ECON' ? 'w-14' : 'w-[2rem]'} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1].map((index) => {
              const bowler = bowlersInTable[index];
              const isCurrentBowler = index === currentBowlerIndex && bowler;
              return (
                <tr
                  key={index}
                  role={bowler ? 'button' : undefined}
                  tabIndex={bowler ? 0 : undefined}
                  onClick={() => bowler && setCurrentBowlerIndexState(index)}
                  onKeyDown={(e) => {
                    if (bowler && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setCurrentBowlerIndexState(index);
                    }
                  }}
                  className={`${bowler ? 'cursor-pointer transition-opacity active:opacity-90' : ''}`}
                >
                  <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3`}>
                    <span className="flex items-center gap-2">
                      <span className={`text-[12px] font-medium ${isCurrentBowler ? 'text-[#DA9811]' : 'text-white'}`}>
                        {bowler ? bowler.name : DASH}
                      </span>
                      {isCurrentBowler && (
                        <span
                          className="scoring-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                          aria-label="Bowling"
                        />
                      )}
                    </span>
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {bowler ? ballsToOvers(bowler.balls ?? 0) : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {bowler ? bowler.maidens : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {bowler ? bowler.runs : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {bowler ? bowler.wickets : DASH}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {bowler ? economyRate(bowler.runs, (bowler.balls ?? 0) / 6) : DASH}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {canAddMoreBowlers && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex min-h-[5rem] items-center justify-center"
            aria-hidden
          >
            <Button
              type="button"
              variant="dark"
              size="lg"
              className="pointer-events-auto flex flex-col items-center gap-1.5"
              aria-label="Add Bowler"
              onClick={openAddBowlerDialog}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
                Add Bowler
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Over-per-ball stats: inline over label + ball chips only (no total runs) */}
      {oversFromBalls.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => overStatsScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1A] text-white transition-opacity hover:opacity-90 active:opacity-80"
            aria-label="Previous overs"
          >
            <span className="text-lg font-bold">&lsaquo;</span>
          </button>
          <div
            ref={overStatsScrollRef}
            className="flex flex-1 flex-nowrap items-center gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {oversFromBalls.map(({ overIndex, balls }) => (
              <div
                key={overIndex}
                className="flex shrink-0 items-center gap-2 border-r border-[#1C1C1A] pr-3 last:border-r-0 last:pr-0"
              >
                <span className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                  {overOrdinal(overIndex)}
                </span>
                <div className="flex gap-1">
                  {balls.map((b, i) => {
                    const { label, variant } = getBallDisplay(b);
                    const chipClass =
                      variant === 'four'
                        ? 'bg-[#22C55E] text-white'
                        : variant === 'six'
                          ? 'bg-[#A855F7] text-white'
                          : variant === 'wicket'
                            ? 'bg-[#EF4444] text-white'
                            : 'bg-[#2a2a28] text-[#E5E7EB]';
                    return (
                      <span
                        key={i}
                        className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md text-[12px] font-bold ${chipClass}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => overStatsScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1A] text-white transition-opacity hover:opacity-90 active:opacity-80"
            aria-label="Next overs"
          >
            <span className="text-lg font-bold">&rsaquo;</span>
          </button>
        </div>
      )}

      {/* Scoring control – only when two batsmen and at least one bowler are in the table */}
      {batsmenOnCrease.length === 2 && bowlersInTable.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-4 pb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
              <button
                key={runs}
                type="button"
                onClick={() => (runs === 0 ? handleRuns(0) : openShotAreaDialog(runs))}
                className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[14px] font-bold text-white transition-opacity active:opacity-80"
                style={{ backgroundColor: RUN_BUTTON_BG[runs] }}
                aria-label={`${runs} run${runs !== 1 ? 's' : ''}`}
              >
                {runs}
              </button>
            ))}
            <button
              type="button"
              onClick={openCustomScoreDialog}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#46463F] text-[25px] font-bold text-[#DA9811] transition-opacity active:opacity-80"
              aria-label="Add custom score"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => handleSpecial('wd')}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold uppercase text-white transition-opacity active:opacity-80"
              aria-label="Wide"
            >
              WD
            </button>
            <button
              type="button"
              onClick={() => handleSpecial('nb')}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold uppercase text-white transition-opacity active:opacity-80"
              aria-label="No ball"
            >
              NB
            </button>
            <button
              type="button"
              onClick={() => handleSpecial('bye')}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold uppercase text-white transition-opacity active:opacity-80"
              aria-label="Bye"
            >
              BYE
            </button>
            <button
              type="button"
              onClick={() => handleSpecial('lb')}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold uppercase text-white transition-opacity active:opacity-80"
              aria-label="Leg bye"
            >
              LB
            </button>
            <button
              type="button"
              onClick={() => {
                if (batsmenOnCrease.length === 2 && bowlersInTable.length > 0) setOutReasonModalOpen(true);
              }}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold uppercase text-[#DA9811] transition-opacity active:opacity-80"
              aria-label="Out"
            >
              OUT
            </button>
            <button
              type="button"
              onClick={() => handleUndo()}
              className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-red-500 bg-[#141412] text-[8px] font-bold uppercase text-red-500 transition-opacity active:opacity-80"
              aria-label="Undo"
            >
              <span className="flex flex-col items-center">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10h10a5 5 0 0 1 5 5v2" />
                  <path d="M3 10l4-4M3 10l4 4" />
              </svg>
              UNDO
            </span>
          </button>
        </div>
      </div>
      )}

      {/* Out reason bottom sheet – select dismissal type */}
      <Dialog open={outReasonModalOpen} onOpenChange={setOutReasonModalOpen}>
        <DialogContent
          className="out-reason-sheet !fixed !left-0 !right-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 !max-w-none !w-full max-h-[85vh] rounded-t-3xl !bg-[#141412] p-5 pb-8"
          aria-describedby={undefined}
        >
          <div className="flex flex-wrap gap-2 overflow-y-auto">
            {DISMISSAL_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => handleOut(reason)}
                className="flex-grow rounded-[6px] cursor-pointer bg-[black] px-3 py-3 text-center text-[10px] font-medium text-white transition-opacity active:opacity-90 hover:bg-[#1a1a18] hover:opacity-95"
              >
                {reason}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shot area dialog – shown when user taps 1–6 runs */}
      <ShotAreaDialog
        open={shotAreaDialogOpen}
        onOpenChange={(open) => !open && closeShotAreaDialog()}
        onSelect={handleShotDirectionSelect}
      />

      {/* Add custom score dialog */}
      <Dialog open={customScoreDialogOpen} onOpenChange={(open) => !open && closeCustomScoreDialog()}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          <div className="shrink-0 px-5 pt-5">
            <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
              Add Score
            </DialogTitle>
          </div>
          <DialogScrollBody className="flex flex-col">
            <FormField
              htmlFor="custom-score-input"
              label="Custom score"
              className="space-y-2"
              labelClassName={formFieldLabelEditClass}
            >
              <Input
                id="custom-score-input"
                type="number"
                min={0}
                max={99}
                placeholder="Enter custom score"
                value={customScoreInput}
                onChange={(e) => setCustomScoreInput(e.target.value)}
                className="!mb-0 !border-[#DA9811] input-no-spinner"
              />
            </FormField>
          </DialogScrollBody>
          <div className="shrink-0 px-5 pb-5 pt-4">
            <Button
              type="button"
              variant="orangeDialog"
              size="dialog"
              disabled={!customScoreInput.trim()}
              onClick={handleCustomScoreDone}
            >
              Done
            </Button>
          </div>
        </DialogContentProfile>
      </Dialog>

      {/* Add Batsman dialog – Select Batsman | Create New Batsman */}
      <Dialog open={addBatsmanOpen} onOpenChange={(open) => !open && closeAddBatsmanDialog()}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          {addBatsmanView === 'select' ? (
            <>
              <div className="shrink-0 px-5 py-4">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Select Batsman
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col gap-3">
                {batsmanDialogList.map((b) => {
                  const hasBattingStats = isPlayerBattingOrOut(b.id);
                  const canAdd = !hasBattingStats && b.role === 'playing' && canAddMoreBatsmen;
                  const stats = getBatsmanDisplayStats(b.id);
                  return (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => canAdd && addBatsmanToCrease(b)}
                      onKeyDown={(e) => {
                        if (canAdd && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          addBatsmanToCrease(b);
                        }
                      }}
                      className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${canAdd ? 'cursor-pointer transition-opacity active:opacity-90' : ''} ${hasBattingStats ? 'cursor-not-allowed opacity-90' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px] font-bold text-white">
                          {b.name}
                        </span>
                        {hasBattingStats && stats ? (
                          <div className="flex shrink-0 gap-4 text-[12px] text-[#A2A6AB]">
                            <span>R: {stats.runs}</span>
                            <span>B: {stats.balls}</span>
                            <span>4s: {stats.fours}</span>
                            <span>6s: {stats.sixes}</span>
                            <span>SR: {stats.strikeRate}</span>
                          </div>
                        ) : (
                          <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              type="button"
                              size="sm"
                              variant={b.role === 'playing' ? 'orange' : 'black'}
                              onClick={() => setBatsmanRole(b.id, 'playing')}
                              className="text-[12px] font-bold uppercase"
                            >
                              Playing
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={b.role === 'bench' ? 'orange' : 'black'}
                              onClick={() => setBatsmanRole(b.id, 'bench')}
                              className="text-[12px] font-bold uppercase"
                            >
                              Bench
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-2">
                <Button
                  type="button"
                  variant="orangeDialog"
                  size="dialog"
                  className="gap-2"
                  onClick={goToCreateBatsman}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-[18px] leading-none">
                    +
                  </span>
                  Create New
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 px-5 pt-5">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Create New Batsman
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col">
                <FormField
                  htmlFor="new-batsman-name"
                  label="FULL NAME"
                  className="space-y-2"
                  labelClassName={formFieldLabelEditClass}
                >
                  <Input
                    id="new-batsman-name"
                    placeholder="Enter player name"
                    value={newBatsmanName}
                    onChange={(e) => setNewBatsmanName(e.target.value)}
                    className="!mb-0"
                  />
                </FormField>
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-4">
                <Button
                  type="button"
                  variant="orangeDialogWhite"
                  size="dialog"
                  disabled={!newBatsmanName.trim()}
                  onClick={handleAddNewBatsman}
                >
                  Add Batsman
                </Button>
              </div>
            </>
          )}
        </DialogContentProfile>
      </Dialog>

      {/* Add Bowler dialog – Select Bowler | Create New Bowler */}
      <Dialog open={addBowlerOpen} onOpenChange={(open) => !open && closeAddBowlerDialog()}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          {addBowlerView === 'select' ? (
            <>
              <div className="shrink-0 px-5 py-4">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Select Bowler
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col gap-3">
                {availableForBowlerSelection.map((b) => {
                  const canAdd = b.role === 'playing' && canAddMoreBowlers;
                  return (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => canAdd && addBowlerToTable(b)}
                      onKeyDown={(e) => {
                        if (canAdd && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          addBowlerToTable(b);
                        }
                      }}
                      className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${canAdd ? 'cursor-pointer transition-opacity active:opacity-90' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px] font-bold text-white">
                          {b.name}
                        </span>
                        <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="button"
                            size="sm"
                            variant={b.role === 'playing' ? 'orange' : 'black'}
                            onClick={() => setBowlerRole(b.id, 'playing')}
                            className="text-[12px] font-bold uppercase"
                          >
                            Playing
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={b.role === 'bench' ? 'orange' : 'black'}
                            onClick={() => setBowlerRole(b.id, 'bench')}
                            className="text-[12px] font-bold uppercase"
                          >
                            Bench
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-2">
                <Button
                  type="button"
                  variant="orangeDialog"
                  size="dialog"
                  className="gap-2"
                  onClick={goToCreateBowler}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-[18px] leading-none">
                    +
                  </span>
                  Create New
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 px-5 pt-5">
                <DialogTitle className="text-[14px] font-bold uppercase tracking-wide text-[#DA9811]">
                  Create New Bowler
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col">
                <FormField
                  htmlFor="new-bowler-name"
                  label="FULL NAME"
                  className="space-y-2"
                  labelClassName={formFieldLabelEditClass}
                >
                  <Input
                    id="new-bowler-name"
                    placeholder="Enter player name"
                    value={newBowlerName}
                    onChange={(e) => setNewBowlerName(e.target.value)}
                    className="!mb-0"
                  />
                </FormField>
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-4">
                <Button
                  type="button"
                  variant="orangeDialogWhite"
                  size="dialog"
                  disabled={!newBowlerName.trim()}
                  onClick={handleAddNewBowler}
                >
                  Add Bowler
                </Button>
              </div>
            </>
          )}
        </DialogContentProfile>
      </Dialog>
    </div>
  );
}
