/**
 * Overs tab: over-by-over scores for both teams (ScorecardStatusDetails).
 */
import { StatusDetailsPlaceholderTab } from './PlaceholderTab';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';

function OverBadge({ number }) {
  return (
    <span
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#2C2D31] text-[12px] font-bold text-white"
      aria-hidden
    >
      {number}
    </span>
  );
}

function ScoreCell({ overRuns, overWickets, totalRuns, totalWickets }) {
  const wktLabel = totalWickets === 1 ? 'wkt' : 'wkt';
  return (
    <span className="text-[12px]">
      <span className="font-bold text-white">
        {overRuns}/{overWickets}
      </span>
      <span className="font-normal text-[#A2A6AB]">
        {' '}
        ({totalRuns} runs, {totalWickets} {wktLabel})
      </span>
    </span>
  );
}

export function StatusDetailsOversTab({ match, details }) {
  if (!match)
    return <StatusDetailsPlaceholderTab label="Match data unavailable" />;

  const overs = details?.overs;
  const team1Name = match.team1?.name ?? '';
  const team2Name = match.team2?.name ?? '';

  if (!overs?.length) {
    return <StatusDetailsPlaceholderTab label="Overs data unavailable" />;
  }

  let run1 = 0;
  let run2 = 0;
  let wkt1 = 0;
  let wkt2 = 0;

  return (
    <div className="pb-6">
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`w-14 shrink-0 border-t border-r border-b border-l py-2.5 pl-3 text-left font-bold text-white ${BORDER} ${HEADER_BG}`}
              >
                Ovs
              </th>
              <th
                className={`border-t border-r border-b px-4 py-2.5 text-left font-bold text-white ${BORDER} ${HEADER_BG}`}
              >
                {team1Name}
              </th>
              <th
                className={`border-t border-r border-b px-4 py-2.5 text-left font-bold text-white ${BORDER} ${HEADER_BG}`}
              >
                {team2Name}
              </th>
            </tr>
          </thead>
          <tbody>
            {overs.map((row) => {
              const overR1 = row.team1?.runs ?? 0;
              const overW1 = row.team1?.wickets ?? 0;
              const overR2 = row.team2?.runs ?? 0;
              const overW2 = row.team2?.wickets ?? 0;
              run1 += overR1;
              wkt1 += overW1;
              run2 += overR2;
              wkt2 += overW2;
              return (
                <tr key={row.over}>
                  <td
                    className={`w-14 shrink-0 border-r border-b border-l py-3 pl-3 ${BORDER}`}
                  >
                    <OverBadge number={row.over} />
                  </td>
                  <td
                    className={`border-r border-b px-4 py-3 text-white ${BORDER}`}
                  >
                    <ScoreCell
                      overRuns={overR1}
                      overWickets={overW1}
                      totalRuns={run1}
                      totalWickets={wkt1}
                    />
                  </td>
                  <td
                    className={`border-r border-b px-4 py-3 text-white ${BORDER}`}
                  >
                    <ScoreCell
                      overRuns={overR2}
                      overWickets={overW2}
                      totalRuns={run2}
                      totalWickets={wkt2}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
