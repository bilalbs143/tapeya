/**
 * ScorecardTab
 *
 * Displays the full innings scorecard for both teams.
 * Shows:
 *   • Batting table (including retired-hurt batsmen)
 *   • Bowling table (O / M / R / W / Econ)
 *   • Extras breakdown (WD / NB / B / LB / P separately)
 *   • Fall of Wickets (excludes retired_hurt)
 */

import { Fragment, useMemo, useState } from 'react';

import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { isLegalDelivery } from '@/lib/utils/cricketRules';
import {
  ballsToOvers,
  computeExtrasBreakdown,
  getRunsFromBall,
} from '@/lib/utils/scoringUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';
const TEAM_MATCH_ICON = `${CLOUDFRONT_APP_BASE}/images/icons/team-match-icon.svg`;

const DASH = '—';

const STATS_SEPARATOR =
  'w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const BATSMAN_HEADERS = ['R', 'B', '4s', '6s', 'SR'];
const BOWLER_HEADERS = ['O', 'M', 'R', 'W', 'Econ'];

const TABLE_CELL = `border-r border-b ${BORDER} px-4 py-3 text-center text-white`;
const TABLE_CELL_LEFT = `border-r border-b border-l ${BORDER} bg-black px-4 py-3 text-white`;
const TABLE_CELL_LA = `border-r border-b ${BORDER} px-4 py-3 text-white`;
const TABLE_HEADER_CELL = `${HEADER_BG} w-[2.5rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`;
const TABLE_HEADER_FIRST = `${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold text-[#DA9811] ${BORDER}`;
const TABLE_EMPTY_CELL = `border-r border-b border-l ${BORDER} px-4 py-3 text-center text-[#A2A6AB]`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strikeRate(runs, balls) {
  if (!balls) return '0.0';
  return ((Number(runs) / Number(balls)) * 100).toFixed(1);
}

function economyRate(runs, balls) {
  if (!balls) return '0.0';
  return (Number(runs) / (balls / 6)).toFixed(1);
}

/** Cumulative runs up to and including ball at index. */
function runsAt(ballHistory, index) {
  return ballHistory
    .slice(0, index + 1)
    .reduce((s, b) => s + getRunsFromBall(b), 0);
}

/** Legal delivery count up to and including ball at index. */
function validBallsCount(ballHistory, index) {
  let count = 0;
  for (let i = 0; i <= index && i < ballHistory.length; i++) {
    if (isLegalDelivery(ballHistory[i].type)) count += 1;
  }
  return count;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object}   props.match
 * @param {object}   [props.liveScore]                   Innings 1 live score
 * @param {object[]} [props.ballHistory]                 Innings 1 balls
 * @param {object[]} [props.batsmenOnCrease]             Innings 1 active batsmen
 * @param {object[]} [props.retiredBatsmen]              Innings 1 retired hurt list
 * @param {object[]} [props.bowlersInTable]              Innings 1 active bowlers
 * @param {object[]} [props.secondInningsBallHistory]
 * @param {object[]} [props.secondInningsBatsmenOnCrease]
 * @param {object[]} [props.secondInningsRetiredBatsmen]
 * @param {object[]} [props.secondInningsBowlersInTable]
 * @param {object}   [props.secondInningsLiveScore]
 */
export function ScorecardTab({
  match,
  liveScore: liveScoreProp,
  ballHistory = [],
  batsmenOnCrease = [],
  retiredBatsmen = [],
  bowlersInTable = [],
  secondInningsBallHistory = [],
  secondInningsBatsmenOnCrease = [],
  secondInningsRetiredBatsmen = [],
  secondInningsBowlersInTable = [],
  secondInningsLiveScore,
}) {
  const [activeScorecardTeam, setActiveScorecardTeam] = useState('teamA');

  const teamA = match?.teamA;
  const teamB = match?.teamB;
  const teamAName = teamA?.name ?? '';
  const teamBName = teamB?.name ?? '';
  const isTeamBBatting = secondInningsBallHistory.length > 0;
  const showTeamAData = activeScorecardTeam === 'teamA';

  const activeBallHistory = showTeamAData
    ? ballHistory
    : secondInningsBallHistory;
  const activeBatsmenOnCrease = showTeamAData
    ? batsmenOnCrease
    : secondInningsBatsmenOnCrease;
  const activeRetiredBatsmen = showTeamAData
    ? retiredBatsmen
    : secondInningsRetiredBatsmen;
  const activeBowlersInTable = showTeamAData
    ? bowlersInTable
    : secondInningsBowlersInTable;
  const activeLiveScore = showTeamAData
    ? liveScoreProp
    : secondInningsLiveScore;

  // ── Stats summary ──────────────────────────────────────────────────────────

  const statsForView = useMemo(() => {
    if (!showTeamAData && !isTeamBBatting) {
      return {
        extras: DASH,
        oversDisplay: DASH,
        crr: DASH,
        totalRuns: DASH,
        totalWickets: DASH,
      };
    }
    return {
      extras: activeLiveScore?.extras ?? 0,
      oversDisplay: activeLiveScore?.oversDisplay ?? '0',
      crr: activeLiveScore?.crr ?? '0.0',
      totalRuns: activeLiveScore?.totalRuns ?? 0,
      totalWickets: activeLiveScore?.totalWickets ?? 0,
    };
  }, [activeLiveScore, showTeamAData, isTeamBBatting]);

  const totalDisplay =
    typeof statsForView.totalRuns === 'number' &&
    typeof statsForView.totalWickets === 'number'
      ? `${statsForView.totalRuns}/${statsForView.totalWickets}`
      : DASH;

  // ── Extras breakdown ───────────────────────────────────────────────────────

  const extrasBreakdown = useMemo(
    () => computeExtrasBreakdown(activeBallHistory),
    [activeBallHistory],
  );

  // ── Batting list ───────────────────────────────────────────────────────────

  const battingList = useMemo(() => {
    if (!showTeamAData && !isTeamBBatting) return [];

    // Dismissed batsmen (includes retired_hurt for display but with different label)
    const dismissed = (activeBallHistory ?? [])
      .filter(
        (b) => (b.type === 'out' || b.type === 'retired_hurt') && b.striker,
      )
      .map((b) => ({
        name: b.striker.name ?? DASH,
        runs: b.striker.runs ?? 0,
        balls: b.striker.balls ?? 0,
        fours: b.striker.fours ?? 0,
        sixes: b.striker.sixes ?? 0,
        isRetiredHurt: b.type === 'retired_hurt',
      }));

    // Currently on crease
    const onCrease = (activeBatsmenOnCrease ?? []).map((b) => ({
      name: b.name ?? DASH,
      runs: b.runs ?? 0,
      balls: b.balls ?? 0,
      fours: b.fours ?? 0,
      sixes: b.sixes ?? 0,
      isRetiredHurt: false,
      isOnCrease: true,
    }));

    // Retired hurt (they've left the crease without being dismissed)
    const retiredHurtOnBreak = (activeRetiredBatsmen ?? []).map((b) => ({
      name: b.name ?? DASH,
      runs: b.runs ?? 0,
      balls: b.balls ?? 0,
      fours: b.fours ?? 0,
      sixes: b.sixes ?? 0,
      isRetiredHurt: true,
    }));

    return [...onCrease, ...retiredHurtOnBreak, ...dismissed];
  }, [
    activeBallHistory,
    activeBatsmenOnCrease,
    activeRetiredBatsmen,
    showTeamAData,
    isTeamBBatting,
  ]);

  // ── Bowling list ───────────────────────────────────────────────────────────

  const bowlerStatsList = useMemo(() => {
    if (!showTeamAData && !isTeamBBatting) return [];
    return (activeBowlersInTable ?? []).map((bowler) => {
      const byBowler = (activeBallHistory ?? []).filter(
        (b) => b.bowlerId === bowler.id,
      );
      const legalBalls = byBowler.filter((b) => isLegalDelivery(b.type)).length;
      let runs = 0;
      let wickets = 0;
      let maidens = 0;
      let currentOverRuns = 0;
      let currentOverBalls = 0;

      for (const b of byBowler) {
        const ballRuns = b.runs ?? 0;
        runs += ballRuns;
        if (b.type === 'out' && b.dismissalType !== 'retired_hurt')
          wickets += 1;
        if (isLegalDelivery(b.type)) {
          currentOverBalls += 1;
          currentOverRuns += ballRuns;
          if (currentOverBalls === 6) {
            if (currentOverRuns === 0) maidens += 1;
            currentOverBalls = 0;
            currentOverRuns = 0;
          }
        }
      }

      return {
        name: bowler.name ?? DASH,
        overs: ballsToOvers(legalBalls),
        maidens,
        runs,
        wickets,
        econ: economyRate(runs, legalBalls),
      };
    });
  }, [activeBallHistory, activeBowlersInTable, showTeamAData, isTeamBBatting]);

  // ── Fall of wickets (excludes retired_hurt) ────────────────────────────────

  const fallOfWickets = useMemo(() => {
    if (!showTeamAData && !isTeamBBatting) return [];
    return (activeBallHistory ?? [])
      .map((b, i) =>
        b.type === 'out' && b.striker ? { index: i, striker: b.striker } : null,
      )
      .filter(Boolean)
      .map((item, idx) => ({
        wicketNumber: idx + 1,
        batsmanName: item.striker.name ?? DASH,
        scoreAtFall: `${runsAt(activeBallHistory, item.index)}(${ballsToOvers(validBallsCount(activeBallHistory, item.index))})`,
      }));
  }, [activeBallHistory, showTeamAData, isTeamBBatting]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const STATS_ROW_ITEMS = [
    { key: 'extras', label: 'Extras', highlight: false },
    { key: 'oversDisplay', label: 'Overs', highlight: false },
    { key: 'crr', label: 'CRR', highlight: false },
    { key: 'total', label: 'Total', highlight: true },
  ];

  return (
    <div className="mt-4 space-y-6 pb-8">
      {/* Team selector tabs */}
      <div className="flex items-center justify-center gap-12">
        <TeamTabButton
          teamName={teamAName || DASH}
          isActive={activeScorecardTeam === 'teamA'}
          onSelect={() => setActiveScorecardTeam('teamA')}
        />
        <TeamTabButton
          teamName={teamBName || DASH}
          isActive={activeScorecardTeam === 'teamB'}
          onSelect={() => setActiveScorecardTeam('teamB')}
        />
      </div>

      {/* Stats summary bar */}
      <div className="flex">
        {STATS_ROW_ITEMS.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && <div className={STATS_SEPARATOR} aria-hidden />}
            <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
              <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                {item.label}
              </p>
              <p
                className={`mt-0.5 text-[14px] font-bold ${item.highlight ? 'text-[#DA9811]' : 'text-white'}`}
              >
                {item.key === 'total' ? totalDisplay : statsForView[item.key]}
              </p>
            </div>
          </Fragment>
        ))}
      </div>

      {/* Extras breakdown — granular per ICC rules */}
      {activeBallHistory.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-xl bg-[#141412] px-4 py-3">
          <span className="text-[11px] font-bold tracking-wide text-[#A2A6AB] uppercase">
            Extras {extrasBreakdown.total}
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            <ExtrasItem label="WD" value={extrasBreakdown.wides} />
            <ExtrasItem label="NB" value={extrasBreakdown.noBalls} />
            <ExtrasItem label="B" value={extrasBreakdown.byes} />
            <ExtrasItem label="LB" value={extrasBreakdown.legByes} />
            {extrasBreakdown.penaltyRuns > 0 && (
              <ExtrasItem label="P" value={extrasBreakdown.penaltyRuns} />
            )}
          </div>
        </div>
      )}

      {/* Batting table */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th className={TABLE_HEADER_FIRST}>Batsman</th>
              {BATSMAN_HEADERS.map((h) => (
                <th key={h} className={TABLE_HEADER_CELL}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {battingList.length === 0 ? (
              <tr>
                <td colSpan={6} className={TABLE_EMPTY_CELL}>
                  {DASH}
                </td>
              </tr>
            ) : (
              battingList.map((b, idx) => (
                <tr key={idx}>
                  <td className={TABLE_CELL_LEFT}>
                    <span className="flex items-center gap-2">
                      <span
                        className={
                          b.isOnCrease ? 'text-[#DA9811]' : 'text-white'
                        }
                      >
                        {b.name}
                      </span>
                      {b.isRetiredHurt && (
                        <span className="rounded bg-[#3B3B35] px-1 py-0.5 text-[10px] text-[#A2A6AB]">
                          ret hurt
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={TABLE_CELL}>{b.runs}</td>
                  <td className={TABLE_CELL}>{b.balls}</td>
                  <td className={TABLE_CELL}>{b.fours}</td>
                  <td className={TABLE_CELL}>{b.sixes}</td>
                  <td className={TABLE_CELL}>{strikeRate(b.runs, b.balls)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bowling table */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th className={TABLE_HEADER_FIRST}>Bowler</th>
              {BOWLER_HEADERS.map((h) => (
                <th key={h} className={TABLE_HEADER_CELL}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bowlerStatsList.length === 0 ? (
              <tr>
                <td colSpan={6} className={TABLE_EMPTY_CELL}>
                  {DASH}
                </td>
              </tr>
            ) : (
              bowlerStatsList.map((b, idx) => (
                <tr key={idx}>
                  <td className={TABLE_CELL_LEFT}>{b.name}</td>
                  <td className={TABLE_CELL}>{b.overs}</td>
                  <td className={TABLE_CELL}>{b.maidens}</td>
                  <td className={TABLE_CELL}>{b.runs}</td>
                  <td className={TABLE_CELL}>{b.wickets}</td>
                  <td className={TABLE_CELL}>{b.econ}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fall of Wickets */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                colSpan={3}
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold tracking-wide text-[#DA9811] uppercase ${BORDER}`}
              >
                Fall of Wickets
              </th>
            </tr>
          </thead>
          <tbody>
            {fallOfWickets.length === 0 ? (
              <tr>
                <td colSpan={3} className={TABLE_EMPTY_CELL}>
                  {DASH}
                </td>
              </tr>
            ) : (
              fallOfWickets.map((f) => (
                <tr key={f.wicketNumber}>
                  <td className={TABLE_CELL_LEFT}>{f.wicketNumber}</td>
                  <td className={TABLE_CELL_LA}>{f.batsmanName}</td>
                  <td
                    className={`border-r border-b ${BORDER} px-4 py-3 text-right text-white`}
                  >
                    {f.scoreAtFall}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TeamTabButton({ teamName, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0"
      aria-pressed={isActive}
    >
      <img
        src={TEAM_MATCH_ICON}
        alt=""
        className={`h-8 w-8 shrink-0 ${isActive ? '' : 'opacity-70'}`}
        aria-hidden
      />
      <div className="flex flex-col items-center">
        <span
          className={`text-[16px] font-bold tracking-wide uppercase ${isActive ? 'text-[#DA9811]' : 'text-white'}`}
        >
          {teamName}
        </span>
        {isActive && (
          <span
            className="mt-0.5 block h-0.5 w-4/5 min-w-[2rem] rounded-full bg-[#DA9811]"
            aria-hidden
          />
        )}
      </div>
    </button>
  );
}

/** Single extras item — shows "WD 3", "NB 1", etc. */
function ExtrasItem({ label, value }) {
  return (
    <span className="text-[11px] text-white/60">
      <span className="font-semibold text-white/80">{label}</span> {value ?? 0}
    </span>
  );
}
