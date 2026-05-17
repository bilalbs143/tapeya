/**
 * Live tab: current batters + bowlers + partnership (ScorecardStatusDetails).
 */
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';

import { StatusDetailsPlaceholderTab } from './PlaceholderTab';

const BORDER_B = `border-b ${BORDER}`;
const BORDER_R = `border-r ${BORDER}`;
const CELL_PADDING = 'py-3 px-4';
const STAT_COL_WIDTH = 'w-12'; /* R, B, 4s, 6s / O, M, R, W */
const SR_COL_WIDTH = 'w-16'; /* SR: fit decimals e.g. 154.5 */
const STICKY_FIRST = 'sticky left-0 z-10 min-w-[8rem]';
const STICKY_BG = 'bg-black';

function BattingLiveTable({ batters }) {
  return (
    <div className="mb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[24rem] border-collapse text-[12px]">
        <thead>
          <tr className={HEADER_BG}>
            <th className={`${STICKY_FIRST} ${HEADER_BG} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-left font-bold text-white`}>
              Batters
            </th>
            {['R', 'B', '4s', '6s', 'SR'].map((h) => (
              <th
                key={h}
                className={`${HEADER_BG} ${h === 'SR' ? SR_COL_WIDTH : STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center font-bold text-white`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {batters.map((b, i) => (
            <tr key={i}>
              <td className={`${STICKY_FIRST} ${STICKY_BG} ${BORDER_B} ${BORDER_R} ${CELL_PADDING}`}>
                <span className="block truncate text-[12px] font-medium text-white">{b.name}</span>
              </td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.r}</td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.b}</td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.fours}</td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.sixes}</td>
              <td className={`${SR_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.sr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BowlingLiveTable({ bowlers }) {
  return (
    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[20rem] border-collapse text-[12px]">
        <thead>
          <tr className={HEADER_BG}>
            <th className={`${STICKY_FIRST} ${HEADER_BG} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-left font-bold text-white`}>
              Bowlers
            </th>
            {['O', 'M', 'R', 'W'].map((h) => (
              <th
                key={h}
                className={`${HEADER_BG} ${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center font-bold text-white`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bowlers.map((b, i) => (
            <tr key={i}>
              <td className={`${STICKY_FIRST} ${STICKY_BG} ${BORDER_B} ${BORDER_R} ${CELL_PADDING}`}>
                <span className="block truncate text-[12px] font-medium text-white">{b.name}</span>
              </td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.o}</td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.m}</td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center text-white`}>{b.r}</td>
              <td className={`${STAT_COL_WIDTH} ${BORDER_B} ${BORDER_R} ${CELL_PADDING} text-center font-semibold text-white`}>
                {b.w}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusDetailsLiveTab({ details }) {
  const batters = details?.batters;
  const bowlers = details?.bowlers;
  if (!details || ((!batters || batters.length === 0) && (!bowlers || bowlers.length === 0))) {
    return <StatusDetailsPlaceholderTab label="Live data unavailable" />;
  }
  return (
    <div className="pb-6">
      <BattingLiveTable batters={details.batters} />
      <BowlingLiveTable bowlers={details.bowlers} />
      {details.partnership && (
        <div className="space-y-1 pt-3">
          <p className="text-[14px]">
            <span className="text-[#A2A6AB]">P&apos;SHIP:</span> <span className="text-white">{details.partnership}</span>
          </p>
          {details.batters?.[0] && (
            <p className="text-[14px]">
              <span className="text-[#A2A6AB]">L&apos;BAT:</span>{' '}
              <span className="text-white">
                {details.batters[0].name} {details.batters[0].r} ({details.batters[0].b}b)
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
