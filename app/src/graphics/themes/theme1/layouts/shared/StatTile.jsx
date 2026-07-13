import { cn } from '@/lib/utils';

import { fsStatTile } from '../../config';
import { DISPLAY_FONT, UI_FONT } from '../../primitives';

const statTileLabelClass = cn('font-semibold leading-none tracking-[0.16em] text-[var(--text-secondary)] uppercase', UI_FONT);

const statTileValueClass = cn('font-extrabold leading-none whitespace-nowrap text-white', DISPLAY_FONT);

/**
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
}) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-col items-center justify-center rounded-2xl border',
        'bg-[linear-gradient(180deg,rgba(26,32,48,0.92),rgba(12,16,26,0.95))]',
        className,
      )}
      style={{
        ...(height != null ? { height } : null),
        width,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        gap: labelGap,
        borderColor: 'rgba(120,140,255,0.28)',
        boxShadow:
          '0 10px 30px rgba(0,0,0,0.45), 0 0 calc(18px * var(--glow)) rgba(91,124,255,0.13), inset 0 1px 0 rgba(255,255,255,0.05)',
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
