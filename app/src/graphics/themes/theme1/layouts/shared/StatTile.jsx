import { cn } from '@/lib/utils';

import { fsStatTile } from '../../config';
import { DISPLAY_FONT, UI_FONT } from '../../primitives';

const statTileLabelClass = cn('font-semibold leading-none tracking-[0.16em] text-[var(--text-secondary)] uppercase', UI_FONT);

const statTileValueClass = cn('font-extrabold leading-none whitespace-nowrap text-white', DISPLAY_FONT);

/**
 * @param {{
 *   label: string,
 *   value: string | number,
 *   accent: string,
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
  accent,
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
        'flex min-h-0 flex-col items-center justify-center rounded-2xl',
        'bg-[linear-gradient(180deg,rgba(26,32,48,0.92),rgba(12,16,26,0.95))]',
        'border border-[color-mix(in_srgb,var(--tile-accent)_33%,transparent)]',
        '[box-shadow:0_10px_30px_rgba(0,0,0,0.45),0_0_calc(18px*var(--glow))_color-mix(in_srgb,var(--tile-accent)_13%,transparent),inset_0_1px_0_rgba(255,255,255,0.05)]',
        className,
      )}
      style={{
        ...(height != null ? { height } : null),
        width,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        gap: labelGap,
        '--tile-accent': accent,
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
