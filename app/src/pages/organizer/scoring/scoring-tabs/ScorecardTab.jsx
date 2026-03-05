/**
 * Scorecard tab – Team A / Team B tabs, stats row, batsman table, bowler table, fall of wickets table.
 * Uses live data from ScoringMatch (ballHistory, batsmenOnCrease, bowlersInTable, liveScore).
 * Team B scorecard shows "--" when they have not started batting yet.
 */

import { useMemo, useState } from 'react';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import { ballsToOvers, getRunsFromBall } from '../scoringUtils';

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_TEAM = { name: '' };

const DEFAULT_LIVE_SCORE = {
  totalRuns: 0,
  totalWickets: 0,
  oversDisplay: '0',
  maxOvers: 20,
  extras: 0,
  crr: '0.0',
};

const STATS_SEPARATOR =
  'w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';
const DASH = '—';

/** 1st innings: Team A bats, Team B bowls. */
const BATTING_TEAM = 'teamA';

function strikeRate(runs, balls) {
  if (!balls) return '0.0';
  return ((Number(runs) / Number(balls)) * 100).toFixed(1);
}

/** Valid deliveries (exclude WD, NB) up to and including index. */
function validBallsCount(ballHistory, upToIndex) {
  let count = 0;
  for (let i = 0; i <= upToIndex && i < ballHistory.length; i++) {
    const b = ballHistory[i];
    if (b && b.type !== 'wd' && b.type !== 'nb') count += 1;
  }
  return count;
}

/** Runs total up to and including index. */
function runsAt(ballHistory, index) {
  return ballHistory
    .slice(0, index + 1)
    .reduce((s, b) => s + getRunsFromBall(b), 0);
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ScorecardTab({
  match,
  liveScore: liveScoreProp,
  ballHistory = [],
  batsmenOnCrease = [],
  bowlersInTable = [],
}) {
  const [activeScorecardTeam, setActiveScorecardTeam] = useState(BATTING_TEAM);

  const teamA = match?.teamA ?? DEFAULT_TEAM;
  const teamB = match?.teamB ?? DEFAULT_TEAM;
  const liveScore = liveScoreProp ?? DEFAULT_LIVE_SCORE;

  const teamAName = teamA.name || 'Team A';
  const teamBName = teamB.name || 'Team B';

  /** Team A is batting in 1st innings; Team B has not batted yet. */
  const isTeamABatting = true;
  const isTeamBBatting = false;

  const showTeamAData = activeScorecardTeam === 'teamA';
  const showTeamBData = activeScorecardTeam === 'teamB';

  // Stats for the visible tab: Team A gets live data, Team B gets placeholders when not batting
  const statsForView = useMemo(() => {
    if (showTeamAData) {
      return {
        extras: liveScore.extras,
        oversDisplay: liveScore.oversDisplay,
        crr: liveScore.crr,
        totalRuns: liveScore.totalRuns,
        totalWickets: liveScore.totalWickets,
      };
    }
    if (showTeamBData && !isTeamBBatting) {
      return { extras: DASH, oversDisplay: DASH, crr: DASH, totalRuns: DASH, totalWickets: DASH };
    }
    return { extras: 0, oversDisplay: '0', crr: '0.0', totalRuns: 0, totalWickets: 0 };
  }, [showTeamAData, showTeamBData, isTeamBBatting, liveScore]);

  // ─── Derived: batting list (current + dismissed) for Team A ───────────────

  const battingList = useMemo(() => {
    if (showTeamBData && !isTeamBBatting) return [];
    const dismissed = (ballHistory || [])
      .filter((b) => b.type === 'out' && b.striker)
      .map((b) => ({
        name: b.striker.name ?? DASH,
        runs: b.striker.runs ?? 0,
        balls: b.striker.balls ?? 0,
        fours: b.striker.fours ?? 0,
        sixes: b.striker.sixes ?? 0,
      }));
    const current = (batsmenOnCrease || []).map((b) => ({
      name: b.name ?? DASH,
      runs: b.runs ?? 0,
      balls: b.balls ?? 0,
      fours: b.fours ?? 0,
      sixes: b.sixes ?? 0,
    }));
    return [...current, ...dismissed];
  }, [ballHistory, batsmenOnCrease, showTeamBData, isTeamBBatting]);

  // ─── Derived: bowler stats (O, 0s, 4s, 6s, WD) from ballHistory ────────────

  const bowlerStatsList = useMemo(() => {
    if (showTeamBData && !isTeamBBatting) return [];
    return (bowlersInTable || []).map((bowler) => {
      const ballsByBowler = (ballHistory || []).filter((b) => b.bowlerId === bowler.id);
      const validBalls = ballsByBowler.filter((b) => b.type !== 'wd' && b.type !== 'nb').length;
      let dots = 0;
      let fours = 0;
      let sixes = 0;
      let wides = 0;
      ballsByBowler.forEach((b) => {
        if (b.type === 'wd') wides += 1;
        else if (b.type === 'runs') {
          const r = b.runs ?? 0;
          if (r === 0) dots += 1;
          else if (r === 4) fours += 1;
          else if (r === 6) sixes += 1;
        }
      });
      return {
        name: bowler.name ?? DASH,
        overs: ballsToOvers(validBalls),
        dots,
        fours,
        sixes,
        wides,
      };
    });
  }, [ballHistory, bowlersInTable, showTeamBData, isTeamBBatting]);

  // ─── Derived: fall of wickets ───────────────────────────────────────────

  const fallOfWickets = useMemo(() => {
    if (showTeamBData && !isTeamBBatting) return [];
    return (ballHistory || [])
      .map((b, i) => (b.type === 'out' && b.striker ? { index: i, striker: b.striker } : null))
      .filter(Boolean)
      .map((item, idx) => {
        const totalRuns = runsAt(ballHistory, item.index);
        const validCount = validBallsCount(ballHistory, item.index);
        const oversStr = ballsToOvers(validCount);
        return {
          wicketNumber: idx + 1,
          batsmanName: item.striker.name ?? DASH,
          scoreAtFall: `${totalRuns}(${oversStr})`,
        };
      });
  }, [ballHistory, showTeamBData, isTeamBBatting]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 space-y-6 pb-8">
      {/* Team A | Team B – tabs to switch scorecard */}
      <div className="flex items-center justify-center gap-12">
        <button
          type="button"
          onClick={() => setActiveScorecardTeam('teamA')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
          aria-pressed={activeScorecardTeam === 'teamA'}
        >
          <img
            src={teamMatchIcon}
            alt=""
            className={`h-8 w-8 shrink-0 ${activeScorecardTeam === 'teamA' ? '' : 'opacity-70'}`}
            aria-hidden
          />
          <div className="flex flex-col items-center">
            <span
              className={`text-[16px] font-bold uppercase tracking-wide ${
                activeScorecardTeam === 'teamA'
                  ? 'text-[#DA9811]'
                  : 'text-white'
              }`}
            >
              {teamAName}
            </span>
            {activeScorecardTeam === 'teamA' && (
              <span
                className="mt-0.5 block h-0.5 w-4/5 min-w-[2rem] rounded-full bg-[#DA9811]"
                aria-hidden
              />
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveScorecardTeam('teamB')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
          aria-pressed={activeScorecardTeam === 'teamB'}
        >
          <img
            src={teamMatchIcon}
            alt=""
            className={`h-8 w-8 shrink-0 ${activeScorecardTeam === 'teamB' ? '' : 'opacity-70'}`}
            aria-hidden
          />
          <div className="flex flex-col items-center">
            <span
              className={`text-[16px] font-bold uppercase tracking-wide ${
                activeScorecardTeam === 'teamB'
                  ? 'text-[#DA9811]'
                  : 'text-white'
              }`}
            >
              {teamBName}
            </span>
            {activeScorecardTeam === 'teamB' && (
              <span
                className="mt-0.5 block h-0.5 w-4/5 min-w-[2rem] rounded-full bg-[#DA9811]"
                aria-hidden
              />
            )}
          </div>
        </button>
      </div>

      {/* Stats row: EXTRAS | OVERS | CRR | TOTAL */}
      <div className="flex">
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">Extras</p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{statsForView.extras}</p>
        </div>
        <div className={STATS_SEPARATOR} aria-hidden />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">Overs</p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{statsForView.oversDisplay}</p>
        </div>
        <div className={STATS_SEPARATOR} aria-hidden />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">CRR</p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{statsForView.crr}</p>
        </div>
        <div className={STATS_SEPARATOR} aria-hidden />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">Total</p>
          <p className="mt-0.5 text-[14px] font-bold text-[#DA9811]">
            {typeof statsForView.totalRuns === 'number' && typeof statsForView.totalWickets === 'number'
              ? `${statsForView.totalRuns}/${statsForView.totalWickets}`
              : DASH}
          </p>
        </div>
      </div>

      {/* Batsman table: R, B, 4s, 6s, SR */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold text-[#DA9811] ${BORDER}`}
              >
                Batsman
              </th>
              {['R', 'B', '4s', '6s', 'SR'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} w-[2.5rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {battingList.length === 0 ? (
              <tr>
                <td colSpan={6} className={`border-r border-b border-l ${BORDER} px-4 py-3 text-center text-[#A2A6AB]`}>
                  {DASH}
                </td>
              </tr>
            ) : (
              battingList.map((b, idx) => (
                <tr key={idx}>
                  <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3 text-white`}>
                    {b.name}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.runs}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.balls}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.fours}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.sixes}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                    {strikeRate(b.runs, b.balls)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bowler table: O, 0s, 4s, 6s, WD */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold text-[#DA9811] ${BORDER}`}
              >
                Bowler
              </th>
              {['O', '0s', '4s', '6s', 'WD'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} w-[2.5rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bowlerStatsList.length === 0 ? (
              <tr>
                <td colSpan={6} className={`border-r border-b border-l ${BORDER} px-4 py-3 text-center text-[#A2A6AB]`}>
                  {DASH}
                </td>
              </tr>
            ) : (
              bowlerStatsList.map((b, idx) => (
                <tr key={idx}>
                  <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3 text-white`}>
                    {b.name}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.overs}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.dots}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.fours}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.sixes}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{b.wides}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fall of Wickets – table: heading spans full width; 3 cols = No. | Batsman | Score (Overs) */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                colSpan={3}
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold uppercase tracking-wide text-[#DA9811] ${BORDER}`}
              >
                Fall of Wickets
              </th>
            </tr>
          </thead>
          <tbody>
            {fallOfWickets.length === 0 ? (
              <tr>
                <td colSpan={3} className={`border-r border-b border-l ${BORDER} px-4 py-3 text-center text-[#A2A6AB]`}>
                  {DASH}
                </td>
              </tr>
            ) : (
              fallOfWickets.map((f) => (
                <tr key={f.wicketNumber}>
                  <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3 text-white`}>
                    {f.wicketNumber}
                  </td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-white`}>{f.batsmanName}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-right text-white`}>{f.scoreAtFall}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
