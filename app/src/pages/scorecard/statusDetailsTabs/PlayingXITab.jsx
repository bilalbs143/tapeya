/**
 * Playing XI tab: two-column squad list with match title (ScorecardStatusDetails).
 */
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { formatListIndex } from '@/lib/format';

import { StatusDetailsPlaceholderTab } from './PlaceholderTab';

export function StatusDetailsPlayingXITab({ match, details }) {
  if (!match) return <StatusDetailsPlaceholderTab label="Match Data Unavailable" />;

  const playingXI = details?.playingXI;
  const team1Name = match.team1?.name ?? '';
  const team2Name = match.team2?.name ?? '';
  const matchTitle = match.matchId ? String(match.matchId).toUpperCase() : '';

  if (!playingXI?.team1?.length && !playingXI?.team2?.length) {
    return <StatusDetailsPlaceholderTab label="Playing XI Data Unavailable" />;
  }

  const team1Players = playingXI.team1 ?? [];
  const team2Players = playingXI.team2 ?? [];

  const MAIN_XI_COUNT = 11;

  const mainTeam1 = team1Players.slice(0, MAIN_XI_COUNT);
  const mainTeam2 = team2Players.slice(0, MAIN_XI_COUNT);

  const benchTeam1 = team1Players.slice(MAIN_XI_COUNT);
  const benchTeam2 = team2Players.slice(MAIN_XI_COUNT);
  const benchRowCount = Math.max(benchTeam1.length, benchTeam2.length, 0);

  const renderTable = (players1, players2, startIndex, showHeader = true) => {
    const rows = Math.max(players1.length, players2.length, 1);
    return (
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          {showHeader && (
            <thead>
              <tr className={HEADER_BG}>
                <th
                  className={`w-8 shrink-0 border-t border-r border-b border-l py-2.5 pl-3 text-left text-muted ${BORDER} ${HEADER_BG}`}
                  aria-label="Index"
                />
                <th
                  className={`border-t border-r border-b px-4 py-2.5 text-left font-semibold text-white ${BORDER} ${HEADER_BG}`}
                >
                  {team1Name}
                </th>
                <th
                  className={`border-t border-r border-b px-4 py-2.5 text-left font-semibold text-white ${BORDER} ${HEADER_BG}`}
                >
                  {team2Name}
                </th>
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }, (_, i) => {
              const isFirstRow = i === 0;
              const topBorderClass = !showHeader && isFirstRow ? ' border-t' : '';

              return (
                <tr key={startIndex + i}>
                  <td className={`w-8 shrink-0 border-r border-b border-l py-3 pl-3 text-white ${BORDER}${topBorderClass}`}>
                    {formatListIndex(startIndex + i)}
                  </td>
                  <td className={`border-r border-b px-4 py-3 ${BORDER}${topBorderClass}`}>
                    {players1[i] ? (
                      <>
                        <p className="text-[12px] font-bold text-white">{players1[i].name}</p>
                        <p className="mt-0.5 text-[12px] text-muted">{players1[i].playing_role}</p>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className={`border-r border-b px-4 py-3 ${BORDER}${topBorderClass}`}>
                    {players2[i] ? (
                      <>
                        <p className="text-[12px] font-bold text-white">{players2[i].name}</p>
                        <p className="mt-0.5 text-[12px] text-muted">{players2[i].playing_role}</p>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="pb-6">
      {matchTitle && <p className="mb-4 text-[13px] font-bold tracking-wide text-muted uppercase">{matchTitle}</p>}

      {renderTable(mainTeam1, mainTeam2, 1)}

      {benchRowCount > 0 && (
        <>
          <p className="mt-6 mb-2 text-[13px] font-bold tracking-wide text-muted uppercase">Bench</p>
          {renderTable(benchTeam1, benchTeam2, MAIN_XI_COUNT + 1, false)}
        </>
      )}
    </div>
  );
}
