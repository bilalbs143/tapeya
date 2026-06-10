import { useMemo, useState } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useMatchSquads } from '@/hooks/useMatchSquads';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { apiPartnershipsToUiState } from '@/lib/utils/scoringMappers';
import { useGetScorecardQuery } from '@/store/api/matchApi';

const ballIcon = `${CLOUDFRONT_APP_BASE}/images/icons/ball-icon.svg`;

const VERTICAL_SEPARATOR = 'w-px shrink-0 min-h-8 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';
const INNINGS_ACTIVE_CLASS = 'text-brand font-bold border-b-2 border-brand pb-1';
const INNINGS_INACTIVE_CLASS = 'text-white font-bold';

export function PartnershipTab() {
  const { matchId } = useScoringMatch();
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });
  const { innings1Squads, innings2Squads } = useMatchSquads();

  const [activeInnings, setActiveInnings] = useState('1');

  const innings1 = useMemo(() => {
    const sc = scorecard?.innings?.[0];
    return { partnerships: apiPartnershipsToUiState(sc?.partnerships ?? [], innings1Squads.nameMap, sc?.batting_stats ?? []) };
  }, [scorecard?.innings, innings1Squads.nameMap]);

  const innings2 = useMemo(() => {
    const sc = scorecard?.innings?.[1];
    return { partnerships: apiPartnershipsToUiState(sc?.partnerships ?? [], innings2Squads.nameMap, sc?.batting_stats ?? []) };
  }, [scorecard?.innings, innings2Squads.nameMap]);

  const inningsData = activeInnings === '1' ? innings1 : innings2;
  const { completed = [], current = null } = inningsData.partnerships ?? {};

  const currentRow = current
    ? {
        id: 'current',
        isCurrent: true,
        batter1: current.batter1 ?? { name: '—', runs: null, balls: null },
        batter2: current.batter2 ?? { name: '—', runs: null, balls: null },
        runs: current.runs ?? 0,
        balls: current.balls ?? 0,
      }
    : null;

  const allPartnerships = currentRow ? [...completed, currentRow] : completed;

  return (
    <div className="mt-4 flex flex-col pb-8">
      {/* Innings tabs */}
      <div className="flex justify-center gap-6 pb-2">
        {['1', '2'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setActiveInnings(n)}
            className={`text-[14px] tracking-wide uppercase ${activeInnings === n ? INNINGS_ACTIVE_CLASS : INNINGS_INACTIVE_CLASS}`}
          >
            {n === '1' ? '1st' : '2nd'} Innings
          </button>
        ))}
      </div>

      {/* Partnership list */}
      <div className="mt-4 flex flex-col gap-0">
        {allPartnerships.length === 0 ? (
          <p className="text-muted py-6 text-center text-[13px]">No partnerships yet.</p>
        ) : (
          allPartnerships.map((p, index) => (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-4 py-3 ${
                index < allPartnerships.length - 1 ? 'border-b border-[#FFFFFF1A]' : ''
              }`}
            >
              {/* Batter 1 */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="text-muted truncate text-[12px] font-semibold">{p.batter1.name}</span>
                <div className={VERTICAL_SEPARATOR} aria-hidden />
                <span className="text-muted shrink-0 text-[12px]">
                  {p.batter1.runs != null && p.batter1.balls != null ? `${p.batter1.runs}(${p.batter1.balls})` : '—'}
                </span>
              </div>

              {/* Stand total */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <img src={ballIcon} alt="" className="h-4 w-4" aria-hidden />
                <span className="text-[12px] whitespace-nowrap text-white">
                  {p.runs}
                  <span className="text-muted"> / </span>
                  {p.balls}b
                  {p.isCurrent && (
                    <span
                      className="partnership-blink-dot ml-1.5 inline-block h-2 w-2 rounded-full bg-red-500 align-middle"
                      aria-label="Current Partnership"
                    />
                  )}
                </span>
              </div>

              {/* Batter 2 */}
              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                <span className="text-muted shrink-0 text-[12px]">
                  {p.batter2.runs != null && p.batter2.balls != null ? `${p.batter2.runs}(${p.batter2.balls})` : '—'}
                </span>
                <div className={VERTICAL_SEPARATOR} aria-hidden />
                <span className="text-muted truncate text-[12px] font-semibold">{p.batter2.name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
