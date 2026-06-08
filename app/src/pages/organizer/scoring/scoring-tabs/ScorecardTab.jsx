/**
 * ScorecardTab
 *
 * Displays the full innings scorecard. All stats are pre-computed by the
 * backend scorecard API — no frontend calculations here.
 */

import { Fragment, useState } from 'react';

import { TeamLogo } from '@/components/TeamLogo';
import { useScoringMatch } from '@/context/ScoringMatchContext';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { useGetMatchStateQuery, useGetScorecardQuery } from '@/store/api/matchApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const DASH = '—';

const STATS_SEPARATOR = 'w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const BATSMAN_HEADERS = ['R', 'B', '4s', '6s', 'SR'];
const BOWLER_HEADERS = ['O', 'M', 'R', 'W', 'Econ'];

const TABLE_CELL = `border-r border-b ${BORDER} px-4 py-3 text-center text-white`;
const TABLE_CELL_LEFT = `border-r border-b border-l ${BORDER} bg-black px-4 py-3 text-white`;
const TABLE_CELL_LA = `border-r border-b ${BORDER} px-4 py-3 text-white`;
const TABLE_HEADER_CELL = `${HEADER_BG} w-[2.5rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`;
const TABLE_HEADER_FIRST = `${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold text-brand ${BORDER}`;
const TABLE_EMPTY_CELL = `border-r border-b border-l ${BORDER} px-4 py-3 text-center text-muted`;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.match      Match object with teamA / teamB info.
 * @param {object}  [props.innings1] Innings 1 from the scorecard API response.
 * @param {object}  [props.innings2] Innings 2 from the scorecard API response.
 */
export function ScorecardTab() {
  const { matchId, match } = useScoringMatch();
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });
  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId });

  const innings1 = scorecard?.innings?.[0] ?? null;
  const innings2 = scorecard?.innings?.[1] ?? null;
  const activeBowlerId = matchState?.active_innings?.bowler?.id ?? null;

  const [activeScorecardTeam, setActiveScorecardTeam] = useState('teamA');

  const teamAName = match?.teamA?.name ?? '';
  const teamBName = match?.teamB?.name ?? '';
  const teamA = match?.teamA;
  const teamB = match?.teamB;
  const showTeamAData = activeScorecardTeam === 'teamA';

  const innings = showTeamAData ? innings1 : innings2;

  // Stats summary values — read directly from the API innings object
  const totalRuns = innings?.total_runs ?? 0;
  const totalWickets = innings?.total_wickets ?? 0;
  const totalExtras = innings?.total_extras ?? 0;
  const oversDisplay = innings?.overs_display ?? '0.0';
  const runRate = innings?.run_rate ?? '0.00';
  const strikerId = innings?.current_striker_id;

  const hasData = !!innings;
  const totalDisplay = hasData ? `${totalRuns}/${totalWickets}` : DASH;

  const extras = innings?.extras_breakdown ?? {};
  const batting = innings?.batting_stats ?? [];
  const bowling = innings?.bowling_stats ?? [];
  const fow = innings?.fall_of_wickets ?? [];

  const STATS_ROW = [
    { label: 'Extras', value: hasData ? totalExtras : DASH },
    { label: 'Overs', value: hasData ? oversDisplay : DASH },
    { label: 'CRR', value: hasData ? runRate : DASH },
    { label: 'Total', value: totalDisplay, highlight: true },
  ];

  return (
    <div className="mt-4 space-y-6 pb-8">
      {/* Team selector tabs */}
      <div className="flex items-center justify-center gap-12">
        <TeamTabButton
          team={teamA}
          teamName={teamAName || DASH}
          isActive={activeScorecardTeam === 'teamA'}
          onSelect={() => setActiveScorecardTeam('teamA')}
        />
        <TeamTabButton
          team={teamB}
          teamName={teamBName || DASH}
          isActive={activeScorecardTeam === 'teamB'}
          onSelect={() => setActiveScorecardTeam('teamB')}
        />
      </div>

      {/* Stats summary bar */}
      <div className="flex">
        {STATS_ROW.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <div className={STATS_SEPARATOR} aria-hidden />}
            <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
              <p className="text-muted text-[12px] font-bold tracking-wide uppercase">{item.label}</p>
              <p className={`mt-0.5 text-[14px] font-bold ${item.highlight ? 'text-brand' : 'text-white'}`}>{item.value}</p>
            </div>
          </Fragment>
        ))}
      </div>

      {/* Extras breakdown */}
      {hasData && (
        <div className="bg-surface flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-xl px-4 py-3">
          <span className="text-muted text-[11px] font-bold tracking-wide uppercase">Extras {totalExtras}</span>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            <ExtrasItem label="WD" value={extras.wides ?? 0} />
            <ExtrasItem label="NB" value={extras.no_balls ?? 0} />
            <ExtrasItem label="B" value={extras.byes ?? 0} />
            <ExtrasItem label="LB" value={extras.leg_byes ?? 0} />
            {(extras.penalty_runs ?? 0) > 0 && <ExtrasItem label="P" value={extras.penalty_runs} />}
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
            {batting.length === 0 ? (
              <tr>
                <td colSpan={6} className={TABLE_EMPTY_CELL}>
                  {DASH}
                </td>
              </tr>
            ) : (
              batting.map((b) => (
                <tr key={b.id}>
                  <td className={TABLE_CELL_LEFT}>
                    <span className="flex items-center gap-2">
                      <span className={b.is_on_crease ? 'text-brand' : 'text-white'}>{b.name}</span>
                      {b.is_on_crease && b.id === strikerId && (
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden />
                      )}
                      {b.is_retired_hurt && (
                        <span className="text-muted rounded bg-[#3B3B35] px-1 py-0.5 text-[10px]">ret hurt</span>
                      )}
                    </span>
                  </td>
                  <td className={TABLE_CELL}>{b.runs}</td>
                  <td className={TABLE_CELL}>{b.balls}</td>
                  <td className={TABLE_CELL}>{b.fours}</td>
                  <td className={TABLE_CELL}>{b.sixes}</td>
                  <td className={TABLE_CELL}>{b.strike_rate}</td>
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
            {bowling.length === 0 ? (
              <tr>
                <td colSpan={6} className={TABLE_EMPTY_CELL}>
                  {DASH}
                </td>
              </tr>
            ) : (
              bowling.map((b) => {
                const isActiveBowler = activeBowlerId != null && b.id === activeBowlerId;
                return (
                  <tr key={b.id}>
                    <td className={TABLE_CELL_LEFT}>
                      <span className="flex items-center gap-2">
                        <span className={isActiveBowler ? 'text-brand' : 'text-white'}>{b.name}</span>
                        {isActiveBowler && <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden />}
                      </span>
                    </td>
                    <td className={TABLE_CELL}>{b.overs}</td>
                    <td className={TABLE_CELL}>{b.maidens}</td>
                    <td className={TABLE_CELL}>{b.runs}</td>
                    <td className={TABLE_CELL}>{b.wickets}</td>
                    <td className={TABLE_CELL}>{b.economy}</td>
                  </tr>
                );
              })
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
                className={`${HEADER_BG} text-brand border-r border-b border-l px-4 py-2.5 text-left text-[12px] font-bold tracking-wide uppercase ${BORDER}`}
              >
                Fall of Wickets
              </th>
            </tr>
          </thead>
          <tbody>
            {fow.length === 0 ? (
              <tr>
                <td colSpan={3} className={TABLE_EMPTY_CELL}>
                  {DASH}
                </td>
              </tr>
            ) : (
              fow.map((f) => (
                <tr key={f.wicket_number}>
                  <td className={TABLE_CELL_LEFT}>{f.wicket_number}</td>
                  <td className={TABLE_CELL_LA}>{f.batsman_name}</td>
                  <td className={`border-r border-b ${BORDER} px-4 py-3 text-right text-white`}>
                    {f.score}({f.overs})
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

function TeamTabButton({ team, teamName, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0"
      aria-pressed={isActive}
    >
      <TeamLogo team={team} name={teamName} variant="scoring" dimmed={!isActive} />
      <div className="flex flex-col items-center">
        <span className={`text-[16px] font-bold tracking-wide uppercase ${isActive ? 'text-brand' : 'text-white'}`}>
          {teamName}
        </span>
        {isActive && <span className="bg-brand mt-0.5 block h-0.5 w-4/5 min-w-[2rem] rounded-full" aria-hidden />}
      </div>
    </button>
  );
}

function ExtrasItem({ label, value }) {
  return (
    <span className="text-[11px] text-white/60">
      <span className="font-semibold text-white/80">{label}</span> {value ?? 0}
    </span>
  );
}
