import { useLayoutEffect, useRef, useState } from 'react';

import { buildCssRotatedStageStyle } from '@/features/stream/landscapeRotatedStageStyle';

/**
 * Player stage — video and overlays share one box.
 *
 * Web landscape: CSS 90° rotation inside the measured parent.
 * iOS native landscape: no CSS rotation — native WKWebView + embed proxy handle orientation.
 */
export default function LandscapeRotatedStage({ children, rotated = false, iosNativeLandscape = false }) {
  const zoneRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const surfaceClass = iosNativeLandscape ? 'bg-transparent' : 'bg-black';
  const useCssRotation = rotated && !iosNativeLandscape;

  useLayoutEffect(() => {
    const el = zoneRef.current;
    if (!el) {
      return undefined;
    }

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const ready = size.w > 0 && size.h > 0;
  const stageStyle =
    useCssRotation && ready
      ? buildCssRotatedStageStyle(size)
      : {
          position: 'relative',
          width: '100%',
          height: '100%',
        };

  return (
    <div
      ref={zoneRef}
      data-live-stage-zone=""
      className={`flex h-full w-full items-center justify-center overflow-hidden ${surfaceClass} ${iosNativeLandscape ? 'pointer-events-none' : ''}`}
    >
      <div className={`overflow-hidden ${surfaceClass} ${iosNativeLandscape ? 'size-full' : ''}`} style={stageStyle}>
        <div className="relative size-full">{children}</div>
      </div>
    </div>
  );
}
