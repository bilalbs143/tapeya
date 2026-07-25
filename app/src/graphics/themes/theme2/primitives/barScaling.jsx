import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../config';
import { useScaledBarSurface } from './barScalingHooks';

export function ScaledBarSurface({
  designWidth,
  edgeToEdge = true,
  barRadius = geometry.barRadius,
  previewGutter = ltBar.previewGutter,
  className,
  children,
}) {
  const { containerRef, innerRef, scale, renderWidth, insetNative, surfaceHeight, radius, containerStyle, innerStyle } =
    useScaledBarSurface(designWidth, edgeToEdge, barRadius, previewGutter);
  const content = typeof children === 'function' ? children({ radius, scale }) : children;

  return (
    <div
      ref={containerRef}
      className={cn('max-w-full overflow-hidden', !insetNative && 'w-full', className)}
      style={{ height: surfaceHeight || undefined, ...containerStyle }}
    >
      <div
        ref={innerRef}
        // insetNative: w-full reflows inside margin box at scale 1 — no fixed renderWidth
        className={cn(insetNative ? 'w-full' : 'origin-top-left')}
        style={insetNative ? innerStyle : { width: renderWidth, transform: `scale(${scale})`, ...innerStyle }}
      >
        {content}
      </div>
    </div>
  );
}
