import { POINTS_TABLE_GROUPS } from './pointsTableData';

const BORDER = 'border-[#1A1A1A]';

const STICKY_TEAMS = 'sticky left-0 z-10 min-w-[140px]';
const HEADER_BG = 'bg-[#141412]';
const STICKY_BODY_BG = 'bg-black';

function SeriesFormCell({ form }) {
  if (!form) return null;
  const chars = form.split('');
  return (
    <span className="inline-flex items-center gap-0.5 font-bold">
      {chars.map((char, i) => (
        <span key={i} className="inline-flex items-center gap-0.5">
          <span className={char === 'W' ? 'text-[#FFC107]' : 'text-[#DC3545]'}>
            {char}
          </span>
          {i < chars.length - 1 && <span className="text-[#6B7280]">.</span>}
        </span>
      ))}
    </span>
  );
}

function PointsTableGroup({ group }) {
  return (
    <section className="mt-8 first:mt-4">
      <h2 className="mb-4 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        {group.label}
      </h2>
      <div className="overflow-x-auto overflow-y-hidden rounded-md border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-max border-collapse text-[12px] text-white">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${STICKY_TEAMS} ${HEADER_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4 text-left font-medium`}
              >
                Teams
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-medium`}
              >
                M
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-medium`}
              >
                W
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-medium`}
              >
                L
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-medium`}
              >
                T
              </th>
              <th
                className={`border-r border-b ${BORDER} w-14 py-3.5 text-center font-medium`}
              >
                PTS
              </th>
              <th
                className={`border-r border-b ${BORDER} w-14 py-3.5 text-center font-medium`}
              >
                NRR
              </th>
              <th
                className={`border-r border-b ${BORDER} w-20 px-1 py-3.5 text-center font-medium`}
              >
                Series Form
              </th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((team) => (
              <tr key={`${group.id}-${team.rank}`}>
                <td
                  className={`${STICKY_TEAMS} ${STICKY_BODY_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4`}
                >
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
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                >
                  {team.m}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                >
                  {team.w}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                >
                  {team.l}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                >
                  {team.t}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                >
                  {team.pts}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                >
                  {team.nrr}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent px-2 py-3.5 text-center`}
                >
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
  const title = tournamentId
    ? `${tournamentId} 2026 - POINTS TABLE`
    : 'POINTS TABLE';

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="text-left text-base text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>
      {POINTS_TABLE_GROUPS.map((group) => (
        <PointsTableGroup key={group.id} group={group} />
      ))}
    </div>
  );
}
