import { Fragment, useMemo, useState } from 'react';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';

import { ballsToOvers, getRunsFromBall } from '../scoringUtils';

const STATS_SEPARATOR =
  'w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const DASH = '—';

/** First innings: Team A bats, Team B bowls. */
const BATTING_TEAM = 'teamA';

const STATS_ROW_ITEMS = [
  { key: 'extras', label: 'Extras', highlight: false },
  { key: 'oversDisplay', label: 'Overs', highlight: false },
  { key: 'crr', label: 'CRR', highlight: false },
  { key: 'total', label: 'Total', highlight: true },
];

const BATSMAN_HEADERS = ['R', 'B', '4s', '6s', 'SR'];
const BOWLER_HEADERS = ['O', '0s', '4s', '6s', 'WD'];

const TABLE_CELL = `border-r border-b ${BORDER} px-4 py-3 text-center text-white`;
const TABLE_CELL_LEFT = `border-r border-b border-l ${BORDER} bg-black px-4 py-3 text-white`;
const TABLE_CELL_LEFT_ALIGN = `border-r border-b ${BORDER} px-4 py-3 text-white`;
const TABLE_HEADER_CELL = `${HEADER_BG} w-[2.5rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`;
const TABLE_HEADER_FIRST = `${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold text-[#DA9811] ${BORDER}`;
const TABLE_EMPTY_CELL = `border-r border-b border-l ${BORDER} px-4 py-3 text-center text-[#A2A6AB]`;

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

export function ScorecardTab({
  match,
  liveScore: liveScoreProp,
  ballHistory = [],
  batsmenOnCrease = [],
  bowlersInTable = [],
  secondInningsBallHistory = [],
  secondInningsBatsmenOnCrease = [],
  secondInningsBowlersInTable = [],
  secondInningsLiveScore,
}) {
  const [activeScorecardTeam, setActiveScorecardTeam] = useState(BATTING_TEAM);

  const teamA = match?.teamA;
  const teamB = match?.teamB;
  const liveScore = liveScoreProp;

  const teamAName = teamA?.name ?? '';
  const teamBName = teamB?.name ?? '';

  /** Team A bats in first innings; Team B bats in second when data exists. */
  const isTeamBBatting = secondInningsBallHistory.length > 0;

  const showTeamAData = activeScorecardTeam === 'teamA';
  const showTeamBData = activeScorecardTeam === 'teamB';

  // Active innings data based on selected team
  const activeBallHistory = showTeamAData
    ? ballHistory
    : secondInningsBallHistory;
  const activeBatsmenOnCrease = showTeamAData
    ? batsmenOnCrease
    : secondInningsBatsmenOnCrease;
  const activeBowlersInTable = showTeamAData
    ? bowlersInTable
    : secondInningsBowlersInTable;
  const activeLiveScore = showTeamAData ? liveScore : secondInningsLiveScore;

  const statsForView = useMemo(() => {
    if (showTeamAData) {
      return {
        extras: activeLiveScore?.extras ?? 0,
        oversDisplay: activeLiveScore?.oversDisplay ?? '0',
        crr: activeLiveScore?.crr ?? '0.0',
        totalRuns: activeLiveScore?.totalRuns ?? 0,
        totalWickets: activeLiveScore?.totalWickets ?? 0,
      };
    }
    if (showTeamBData && !isTeamBBatting) {
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
  }, [activeLiveScore, showTeamAData, showTeamBData, isTeamBBatting]);

  const battingList = useMemo(() => {
    if (showTeamBData && !isTeamBBatting) return [];
    const dismissed = (activeBallHistory || [])
      .filter((b) => b.type === 'out' && b.striker)
      .map((b) => ({
        name: b.striker.name ?? DASH,
        runs: b.striker.runs ?? 0,
        balls: b.striker.balls ?? 0,
        fours: b.striker.fours ?? 0,
        sixes: b.striker.sixes ?? 0,
      }));
    const current = (activeBatsmenOnCrease || []).map((b) => ({
      name: b.name ?? DASH,
      runs: b.runs ?? 0,
      balls: b.balls ?? 0,
      fours: b.fours ?? 0,
      sixes: b.sixes ?? 0,
    }));
    return [...current, ...dismissed];
  }, [activeBallHistory, activeBatsmenOnCrease, showTeamBData, isTeamBBatting]);

  const bowlerStatsList = useMemo(() => {
    if (showTeamBData && !isTeamBBatting) return [];
    return (activeBowlersInTable || []).map((bowler) => {
      const ballsByBowler = (activeBallHistory || []).filter(
        (b) => b.bowlerId === bowler.id,
      );
      const validBalls = ballsByBowler.filter(
        (b) => b.type !== 'wd' && b.type !== 'nb',
      ).length;
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
  }, [activeBallHistory, activeBowlersInTable, showTeamBData, isTeamBBatting]);

  const fallOfWickets = useMemo(() => {
    if (showTeamBData && !isTeamBBatting) return [];
    return (activeBallHistory || [])
      .map((b, i) =>
        b.type === 'out' && b.striker ? { index: i, striker: b.striker } : null,
      )
      .filter(Boolean)
      .map((item, idx) => {
        const totalRuns = runsAt(activeBallHistory, item.index);
        const validCount = validBallsCount(activeBallHistory, item.index);
        const oversStr = ballsToOvers(validCount);
        return {
          wicketNumber: idx + 1,
          batsmanName: item.striker.name ?? DASH,
          scoreAtFall: `${totalRuns}(${oversStr})`,
        };
      });
  }, [activeBallHistory, ballHistory, showTeamBData, isTeamBBatting]);

  const totalDisplay =
    typeof statsForView.totalRuns === 'number' &&
    typeof statsForView.totalWickets === 'number'
      ? `${statsForView.totalRuns}/${statsForView.totalWickets}`
      : DASH;

  return (
    <div className="mt-4 space-y-6 pb-8">
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

      <div className="flex">
        {STATS_ROW_ITEMS.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && <div className={STATS_SEPARATOR} aria-hidden />}
            <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
              <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                {item.label}
              </p>
              <p
                className={`mt-0.5 text-[14px] font-bold ${
                  item.highlight ? 'text-[#DA9811]' : 'text-white'
                }`}
              >
                {item.key === 'total' ? totalDisplay : statsForView[item.key]}
              </p>
            </div>
          </Fragment>
        ))}
      </div>

      {/* Batsman table: R, B, 4s, 6s, SR */}
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
                  <td className={TABLE_CELL_LEFT}>{b.name}</td>
                  <td className={TABLE_CELL}>{b.runs}</td>
                  <td className={TABLE_CELL}>{b.balls}</td>
                  <td className={TABLE_CELL}>{b.fours}</td>
                  <td className={TABLE_CELL}>{b.sixes}</td>
                  <td className={TABLE_CELL}>{strikeRate(b.runs, b.balls)}%</td>
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
                  <td className={TABLE_CELL}>{b.dots}</td>
                  <td className={TABLE_CELL}>{b.fours}</td>
                  <td className={TABLE_CELL}>{b.sixes}</td>
                  <td className={TABLE_CELL}>{b.wides}</td>
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
                  <td className={TABLE_CELL_LEFT_ALIGN}>{f.batsmanName}</td>
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

function TeamTabButton({ teamName, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0"
      aria-pressed={isActive}
    >
      <img
        src={teamMatchIcon}
        alt=""
        className={`h-8 w-8 shrink-0 ${isActive ? '' : 'opacity-70'}`}
        aria-hidden
      />
      <div className="flex flex-col items-center">
        <span
          className={`text-[16px] font-bold tracking-wide uppercase ${
            isActive ? 'text-[#DA9811]' : 'text-white'
          }`}
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
