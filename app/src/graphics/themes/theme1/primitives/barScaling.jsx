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
  const { containerRef, innerRef, scale, surfaceHeight, radius } = useScaledBarSurface(
    designWidth,
    edgeToEdge,
    barRadius,
    previewGutter,
  );
  const content = typeof children === 'function' ? children({ radius, scale }) : children;

  return (
    <div
      ref={containerRef}
      className={cn('w-full max-w-full overflow-hidden', className)}
      style={{ height: surfaceHeight || undefined }}
    >
      <div ref={innerRef} className="origin-top-left" style={{ width: designWidth, transform: `scale(${scale})` }}>
        {content}
      </div>
    </div>
  );
}
