import { POINTS_TABLE_GROUPS } from './pointsTableData';

const BORDER = 'border-[#1A1A1A]';

/** Mock data for innings summary - replace with API later */
const DID_NOT_BAT = [
  'Josie Penfold',
  'Ayaan Lambat',
  'Amie Hucker',
  'Molly Penfold',
  'Bree Illing',
];

const FALL_OF_WICKETS = [
  { wicket: 1, runs: 42, batter: 'Isabella Gaze', over: '5.4' },
  { wicket: 2, runs: 68, batter: 'Prue Catton', over: '9.2' },
  { wicket: 3, runs: 113, batter: 'Maddy Green', over: '15.3' },
  { wicket: 4, runs: 120, batter: 'Brooke Halliday', over: '17.2' },
  { wicket: 5, runs: 146, batter: 'Lauren Down', over: '19.6' },
];

const BOWLING = [
  { name: 'Georgia Plimmer', o: 2, m: 3, r: 6, w: 6, econ: 6 },
  { name: 'Rebecca Burns', o: 1, m: 2, r: 3, w: 3, econ: 3 },
  { name: 'Brooke Halliday', o: 1, m: 2, r: 3, w: 3, econ: 3 },
  { name: 'Rachel Bryant', o: 1, m: 2, r: 3, w: 3, econ: 3 },
  { name: 'Bella Armstrong', o: 1, m: 2, r: 3, w: 3, econ: 3 },
];

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
      <div className="overflow-x-auto overflow-y-hidden border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-max border-collapse text-[12px] text-white">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${STICKY_TEAMS} ${HEADER_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4 text-left font-bold`}
              >
                Teams
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
              >
                M
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
              >
                W
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
              >
                L
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
              >
                T
              </th>
              <th
                className={`border-r border-b ${BORDER} w-14 py-3.5 text-center font-bold`}
              >
                PTS
              </th>
              <th
                className={`border-r border-b ${BORDER} w-14 py-3.5 text-center font-bold`}
              >
                NRR
              </th>
              <th
                className={`border-r border-b ${BORDER} w-20 px-1 py-3.5 text-center font-bold`}
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

function DidNotBatSection({ players }) {
  if (!players?.length) return null;
  return (
    <section className="mt-8 first:mt-4">
      <h2 className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        DID NOT BAT:
      </h2>
      <p className="text-[12px] text-white">{players.join(', ')}</p>
    </section>
  );
}

function FallOfWicketsSection({ items }) {
  if (!items?.length) return null;
  const text = items
    .map(
      (item) => `${item.wicket}-${item.runs} (${item.batter}, ${item.over} ov)`,
    )
    .join(', ');
  return (
    <section className="mt-6">
      <h2 className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        FALL OF WICKETS:
      </h2>
      <p className="text-[12px] text-white">{text}</p>
    </section>
  );
}

function BowlingTable({ rows }) {
  if (!rows?.length) return null;
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        Bowling
      </h2>
      <div className="overflow-x-auto border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-max border-collapse text-[12px] text-white">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`border-r border-b border-l ${BORDER} py-3 pl-4 text-left font-bold`}
              >
                Bowling
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3 text-center font-bold`}
              >
                O
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3 text-center font-bold`}
              >
                M
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3 text-center font-bold`}
              >
                R
              </th>
              <th
                className={`border-r border-b ${BORDER} w-12 py-3 text-center font-bold`}
              >
                W
              </th>
              <th
                className={`border-r border-b ${BORDER} w-14 py-3 text-center font-bold`}
              >
                ECON
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`bowling-${i}`}>
                <td
                  className={`border-r border-b border-l ${BORDER} bg-black py-3 pl-4`}
                >
                  {row.name}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3 text-center`}
                >
                  {row.o}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3 text-center`}
                >
                  {row.m}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3 text-center`}
                >
                  {row.r}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3 text-center`}
                >
                  {row.w}
                </td>
                <td
                  className={`border-r border-b ${BORDER} bg-transparent py-3 text-center`}
                >
                  {row.econ}
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
      <DidNotBatSection players={DID_NOT_BAT} />
      <FallOfWicketsSection items={FALL_OF_WICKETS} />
      <BowlingTable rows={BOWLING} />
    </div>
  );
}
