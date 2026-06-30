import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Player stage — video + overlays (comments, hearts, controls) share one box.
 * When `rotated`, fits a 90°-rotated child inside the measured parent.
 */
export default function LandscapeRotatedStage({ children, rotated = false, transparentUnderlay = false }) {
  const zoneRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const surfaceClass = transparentUnderlay ? 'bg-transparent' : 'bg-black';

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
    rotated && ready
      ? {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size.h,
          height: size.w,
          transform: 'translate(-50%, -50%) rotate(90deg)',
        }
      : {
          position: 'relative',
          width: '100%',
          height: '100%',
        };

  return (
    <div ref={zoneRef} className={`flex h-full w-full items-center justify-center overflow-hidden ${surfaceClass}`}>
      <div className={`overflow-hidden ${surfaceClass}`} style={stageStyle}>
        <div className="relative size-full">{children}</div>
      </div>
    </div>
  );
}
