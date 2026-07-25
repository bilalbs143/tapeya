import { TeamLogoOrCrest } from '../../primitives';
import { BREAK_TILE_SIZE, BreakCenterBadge } from '../full-screen/vsBreak';

export const CHART_CREST_SIZE = BREAK_TILE_SIZE;
export const CHART_CREST_VS_SIZE = 88;
export const CHART_CREST_COLUMN_W = 280;

/** Right-hand team crest column — shared by worm, Manhattan, and wagon wheel charts. */
export function ChartRightCrests({ top, bottom }) {
  return (
    <div
      className="absolute top-0 right-[70px] bottom-0 z-[3] flex flex-col items-center justify-center gap-[26px]"
      style={{ width: CHART_CREST_COLUMN_W }}
      aria-label="Teams"
    >
      <TeamLogoOrCrest
        logoUrl={top?.logoUrl}
        team={top}
        name={top?.name || top?.shortName}
        shortName={top?.shortName || top?.code}
        accent={top?.accent || top?.color}
        size={CHART_CREST_SIZE}
        borderPulseOrder={1}
      />
      <BreakCenterBadge />
      <TeamLogoOrCrest
        logoUrl={bottom?.logoUrl}
        team={bottom}
        name={bottom?.name || bottom?.shortName}
        shortName={bottom?.shortName || bottom?.code}
        accent={bottom?.accent || bottom?.color}
        size={CHART_CREST_SIZE}
        borderPulseOrder={2}
      />
    </div>
  );
}
