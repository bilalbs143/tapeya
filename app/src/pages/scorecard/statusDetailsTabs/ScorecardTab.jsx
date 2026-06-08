/**
 * Scorecard tab: batting scorecard with team selector (ScorecardStatusDetails).
 */
import { useState } from 'react';

import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';

import { StatusDetailsPlaceholderTab } from './PlaceholderTab';

function BattingScorecardTable({ team }) {
  return (
    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className={HEADER_BG}>
            <th className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}>
              Batting
            </th>
            {['R', 'B', '4s', '6s', 'SR'].map((h) => (
              <th key={h} className={`${HEADER_BG} w-[2rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {team.batting.map((player, i) => (
            <tr key={i}>
              <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
                <p className="text-[12px] font-medium text-white">{player.name}</p>
                {player.dismissal && <p className="text-muted mt-0.5 text-[12px]">{player.dismissal}</p>}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{player.r}</td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{player.b}</td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{player.fours}</td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{player.sixes}</td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>{player.sr}</td>
            </tr>
          ))}

          {team.extras && (
            <tr>
              <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
                <p className="text-[13px] font-medium text-white">Extras</p>
                <p className="text-muted mt-0.5 text-[12px]">({team.extras.detail})</p>
              </td>
              <td className={`border-r border-b ${BORDER} py-3 text-center text-white`}>{team.extras.runs}</td>
              <td className={`border-r border-b ${BORDER} py-3 text-center`} />
              <td className={`border-r border-b ${BORDER} py-3 text-center`} />
              <td className={`border-r border-b ${BORDER} py-3 text-center`} />
              <td className={`border-r border-b ${BORDER} py-3 text-center`} />
            </tr>
          )}

          {team.total && (
            <tr className={HEADER_BG}>
              <td className={`${HEADER_BG} border-r border-l ${BORDER} px-4 py-3`}>
                <span className="text-[12px] font-semibold text-white">Total</span>
              </td>
              <td colSpan={4} className={`${HEADER_BG} border-r ${BORDER} px-2 py-3 text-[12px] font-semibold text-white`}>
                {team.total.summary}
              </td>
              <td className={`${HEADER_BG} border-r ${BORDER} py-3 text-center text-[13px] font-semibold text-white`}>
                {team.total.score}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusDetailsScorecardTab({ details }) {
  const [teamIndex, setTeamIndex] = useState(0);

  if (!details?.teams?.length) {
    return <StatusDetailsPlaceholderTab label="Scorecard Data Unavailable" />;
  }

  const teams = details.teams;
  const selectedTeam = teams[teamIndex];

  return (
    <div className="pb-6">
      <div className="mb-4 flex justify-center">
        {teams.map((team, i) => (
          <button
            key={team.name}
            type="button"
            onClick={() => setTeamIndex(i)}
            className={`mr-6 text-[14px] font-normal transition-colors ${i === teamIndex ? 'text-brand' : 'text-muted'}`}
          >
            <span className={i === teamIndex ? 'border-brand inline-block border-b-4 pb-2.5' : 'inline-block pb-3'}>
              {team.name}
            </span>
          </button>
        ))}
      </div>
      <BattingScorecardTable team={selectedTeam} />
    </div>
  );
}
