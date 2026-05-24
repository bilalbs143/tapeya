import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Player stage — video + overlays (comments, hearts, controls) share one box.
 * When `rotated`, fits a 90°-rotated child inside the measured parent.
 */
export default function LandscapeRotatedStage({ children, rotated = false }) {
  const zoneRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

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

  return (
    <div ref={zoneRef} className="flex h-full w-full items-center justify-center overflow-hidden bg-black">
      {ready &&
        (rotated ? (
          <div
            className="absolute top-1/2 left-1/2 overflow-hidden bg-black"
            style={{
              width: size.h,
              height: size.w,
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          >
            <div className="relative size-full">{children}</div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">{children}</div>
        ))}
    </div>
  );
}
