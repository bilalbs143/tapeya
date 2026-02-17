import { POINTS_TABLE_GROUPS } from './pointsTableData';

const BORDER = 'border-[#1A1A1A]';

const STICKY_TEAMS = 'sticky left-0 z-10 min-w-[140px]';
const HEADER_BG = 'bg-[#141412]';
const STICKY_BODY_BG = 'bg-black';

function SeriesFormCell({ form }) {
  if (!form) return null;
  return (
    <span className="inline-flex gap-0.5 font-bold">
      {form.split('').map((char, i) => (
        <span
          key={i}
          className={char === 'W' ? 'text-[#FFC107]' : 'text-[#DC3545]'}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

function PointsTableGroup({ group }) {
  return (
    <section className="mt-8 first:mt-4">
      <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
        {group.label}
      </h2>
      <div
        className="overflow-x-auto overflow-y-hidden rounded-md border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="w-full min-w-max border-collapse text-[12px] text-white">
          <thead>
            <tr className={HEADER_BG}>
              <th className={`${STICKY_TEAMS} ${HEADER_BG} border-b border-l border-r ${BORDER} py-3.5 pl-4 text-left font-medium`}>
                Teams
              </th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-12`}>M</th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-12`}>W</th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-12`}>L</th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-12`}>T</th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-14`}>PTS</th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-14`}>NRR</th>
              <th className={`border-b border-r ${BORDER} py-3.5 text-center font-medium w-20`}>Series Form</th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((team) => (
              <tr key={`${group.id}-${team.rank}`}>
                <td className={`${STICKY_TEAMS} ${STICKY_BODY_BG} border-b border-l border-r ${BORDER} py-3.5 pl-4`}>
                  <div className="flex items-center gap-2.5">
                    <span>{team.rank}</span>
                    <span>{team.name}</span>
                    <img
                      src={team.logo}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-cover"
                      aria-hidden
                    />
                  </div>
                </td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>{team.m}</td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>{team.w}</td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>{team.l}</td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>{team.t}</td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>{team.pts}</td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>{team.nrr}</td>
                <td className={`border-b border-r ${BORDER} py-3.5 text-center bg-transparent`}>
                  <SeriesFormCell form={team.seriesForm} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TableTab({ tournamentId }) {
  const title = tournamentId ? `${tournamentId} 2026 - POINTS TABLE` : 'POINTS TABLE';

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="text-left text-base font-bold uppercase text-[13px] tracking-wide text-white">
        {title}
      </h1>
      {POINTS_TABLE_GROUPS.map((group) => (
        <PointsTableGroup key={group.id} group={group} />
      ))}
    </div>
  );
}
