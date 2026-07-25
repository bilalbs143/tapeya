import { cn } from '@/lib/utils';

import { geometry, ltBar, ltInfoBar } from '../config';
import { useInsetLTBarSurface } from './barScalingHooks';

/**
 * Shared shell for all inset lower-thirds (info, stats, fixture, name, …).
 * Content-sized width clamped between min/max, fixed height, centered in overlay safe area.
 *
 * @param {{
 *   minWidth?: number,
 *   maxWidth?: number,
 *   edgeToEdge?: boolean,
 *   barRadius?: number,
 *   previewGutter?: number,
 *   align?: 'center' | 'start',
 *   className?: string,
 *   children: (ctx: {
 *     radius: number,
 *     barWidth: number,
 *     atMaxWidth: boolean,
 *     scale: number,
 *     measuring?: boolean,
 *   }) => import('react').ReactNode,
 * }} props
 */
export function InsetLTBarSurface({
  minWidth = ltInfoBar.minWidth,
  maxWidth = ltInfoBar.maxWidth,
  edgeToEdge = true,
  barRadius = geometry.barRadius,
  previewGutter = ltBar.previewGutter,
  align = ltInfoBar.align,
  className,
  children,
}) {
  const { containerRef, measureRef, barWidth, atMaxWidth, scale, insetNative, surfaceHeight, slotWidth, containerStyle, radius } =
    useInsetLTBarSurface({
      minWidth,
      maxWidth,
      edgeToEdge,
      barRadius,
      previewGutter,
      align,
    });

  const barCtx = { radius, barWidth, atMaxWidth, scale, measuring: false };
  const measureCtx = { radius, barWidth, atMaxWidth: false, scale: 1, measuring: true };

  return (
    <div ref={containerRef} className={cn('relative max-w-full overflow-hidden', className)} style={containerStyle}>
      <div
        className={cn('shrink-0', !insetNative && 'mx-auto max-w-full')}
        style={{
          width: insetNative ? barWidth : slotWidth || undefined,
          height: surfaceHeight || undefined,
          transform: !insetNative && scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: !insetNative && scale < 1 ? 'top left' : undefined,
        }}
      >
        {children(barCtx)}
      </div>

      {/* Measure layer — text + layout only; heavy slots skip Crest/AnimatedNumber/img when measuring */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 -z-10 opacity-0"
        style={{ width: 'max-content', maxWidth: 'none' }}
      >
        {children(measureCtx)}
      </div>
    </div>
  );
}
