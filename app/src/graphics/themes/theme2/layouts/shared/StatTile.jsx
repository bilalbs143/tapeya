import { cn } from '@/lib/utils';

import { colors, fsStatTile } from '../../config';
import { DISPLAY_FONT, UI_FONT } from '../../primitives';

const statTileLabelClass = cn('font-semibold leading-none tracking-[0.1em] text-white uppercase', UI_FONT);

const statTileValueClass = cn('font-extrabold leading-none whitespace-nowrap text-white', DISPLAY_FONT);

/**
 * Flat theme3 MatchFS stat block (wine or red bowler fill).
 *
 * @param {{
 *   label: string,
 *   value: string | number,
 *   className?: string,
 *   height?: number,
 *   width?: number,
 *   labelSize?: number,
 *   valueSize?: number,
 *   paddingY?: number,
 *   labelGap?: number,
 *   tone?: 'batsman' | 'bowler',
 * }} props
 */
export function StatTile({
  label,
  value,
  className,
  height,
  width = fsStatTile.width,
  labelSize = fsStatTile.label,
  valueSize = fsStatTile.value,
  paddingY = fsStatTile.tilePaddingY,
  labelGap = fsStatTile.tileLabelGap,
  tone = 'batsman',
}) {
  const fill = tone === 'bowler' ? colors.panelBowler : colors.panelPlayer;

  return (
    <div
      className={cn('flex min-h-0 flex-col items-center justify-center rounded', className)}
      style={{
        ...(height != null ? { height } : null),
        width,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        gap: labelGap,
        background: fill,
      }}
    >
      <span className={statTileLabelClass} style={{ fontSize: labelSize }}>
        {label}
      </span>
      <span className={statTileValueClass} style={{ fontSize: valueSize }}>
        {value}
      </span>
    </div>
  );
}
