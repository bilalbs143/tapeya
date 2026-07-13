import { TeamLogoOrCrest, VSBadge } from '../../primitives';

export const CHART_CREST_SIZE = 260;
export const CHART_CREST_VS_SIZE = 110;
export const CHART_CREST_COLUMN_W = 460;

/** Right-hand team crest column — shared by worm, Manhattan, and wagon wheel charts. */
export function ChartRightCrests({ top, bottom }) {
  return (
    <div
      className="absolute top-0 right-[70px] bottom-0 flex flex-col items-center justify-center gap-[26px]"
      style={{ width: CHART_CREST_COLUMN_W }}
    >
      <TeamLogoOrCrest
        logoUrl={top.logoUrl}
        name={top.name}
        shortName={top.shortName}
        size={CHART_CREST_SIZE}
        accent={top.accent}
        borderPulseOrder={1}
      />
      <VSBadge size={CHART_CREST_VS_SIZE} />
      <TeamLogoOrCrest
        logoUrl={bottom.logoUrl}
        name={bottom.name}
        shortName={bottom.shortName}
        size={CHART_CREST_SIZE}
        accent={bottom.accent}
        borderPulseOrder={2}
      />
    </div>
  );
}
