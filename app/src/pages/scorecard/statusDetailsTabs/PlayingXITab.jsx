/**
 * Playing XI tab: two-column squad list with match title (ScorecardStatusDetails).
 */
import { StatusDetailsPlaceholderTab } from './PlaceholderTab';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';

export function StatusDetailsPlayingXITab({ match, details }) {
  if (!match) return <StatusDetailsPlaceholderTab label="Match data unavailable" />;

  const playingXI = details?.playingXI;
  const team1Name = match.team1?.name ?? '';
  const team2Name = match.team2?.name ?? '';
  const matchTitle = match.matchId ? String(match.matchId).toUpperCase() : '';

  if (!playingXI?.team1?.length && !playingXI?.team2?.length) {
    return <StatusDetailsPlaceholderTab label="Playing XI data unavailable" />;
  }

  const team1Players = playingXI.team1 ?? [];
  const team2Players = playingXI.team2 ?? [];

  const MAIN_XI_COUNT = 11;

  const mainTeam1 = team1Players.slice(0, MAIN_XI_COUNT);
  const mainTeam2 = team2Players.slice(0, MAIN_XI_COUNT);
  const mainRowCount = Math.max(mainTeam1.length, mainTeam2.length, 1);

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
                  className={`w-8 shrink-0 border-b border-l border-r border-t py-2.5 pl-3 text-left text-[#A2A6AB] ${BORDER} ${HEADER_BG}`}
                  aria-label="Index"
                />
                <th
                  className={`border-b border-r border-t py-2.5 px-4 text-left font-semibold text-white ${BORDER} ${HEADER_BG}`}
                >
                  {team1Name}
                </th>
                <th
                  className={`border-b border-r border-t py-2.5 px-4 text-left font-semibold text-white ${BORDER} ${HEADER_BG}`}
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
                  <td
                    className={`w-8 shrink-0 border-b border-l border-r py-3 pl-3 text-white ${BORDER}${topBorderClass}`}
                  >
                    {startIndex + i}
                  </td>
                  <td className={`border-b border-r py-3 px-4 ${BORDER}${topBorderClass}`}>
                  {players1[i] ? (
                    <>
                      <p className="text-[12px] font-bold text-white">
                        {players1[i].name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#A2A6AB]">
                        {players1[i].role}
                      </p>
                    </>
                  ) : (
                    <span className="text-[#A2A6AB]">—</span>
                  )}
                </td>
                <td className={`border-b border-r py-3 px-4 ${BORDER}${topBorderClass}`}>
                  {players2[i] ? (
                    <>
                      <p className="text-[12px] font-bold text-white">
                        {players2[i].name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#A2A6AB]">
                        {players2[i].role}
                      </p>
                    </>
                  ) : (
                    <span className="text-[#A2A6AB]">—</span>
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
      {matchTitle && (
        <p className="mb-4 text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
          {matchTitle}
        </p>
      )}

      {renderTable(mainTeam1, mainTeam2, 1)}

      {benchRowCount > 0 && (
        <>
          <p className="mt-6 mb-2 text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            Bench
          </p>
          {renderTable(benchTeam1, benchTeam2, MAIN_XI_COUNT + 1, false)}
        </>
      )}
    </div>
  );
}
