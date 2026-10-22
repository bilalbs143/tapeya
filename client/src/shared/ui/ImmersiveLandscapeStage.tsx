import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/shared/lib/cn';
import { RotateIcon } from '@/shared/ui/icons';

export const MEDIA_ROTATE_BTN_CLASS =
  'grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/12 p-0 text-white/70 backdrop-blur-[8px] transition-[opacity,transform,background-color] active:scale-95 active:bg-white/18 active:opacity-100';

type MediaRotateButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string | undefined;
};

export function MediaRotateButton({ className, children, type = 'button', ...props }: MediaRotateButtonProps) {
  return (
    <button type={type} className={cn(MEDIA_ROTATE_BTN_CLASS, className)} {...props}>
      {children ?? <RotateIcon size="sm" className="h-3 w-3 opacity-90" />}
    </button>
  );
}

type ViewportBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function readVisualViewportBox(): ViewportBox {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  if (vv) {
    return {
      top: vv.offsetTop,
      left: vv.offsetLeft,
      width: Math.max(1, Math.round(vv.width)),
      height: Math.max(1, Math.round(vv.height)),
    };
  }
  return {
    top: 0,
    left: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 1,
    height: typeof window !== 'undefined' ? window.innerHeight : 1,
  };
}

function useVisualViewportBox(active: boolean): ViewportBox {
  const [box, setBox] = useState(readVisualViewportBox);

  useEffect(() => {
    if (!active) return undefined;

    const sync = () => setBox(readVisualViewportBox());
    sync();

    const vv = window.visualViewport;
    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync);

    return () => {
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, [active]);

  return box;
}

/** CSS 90° CW — Full + tilt while WebView is still portrait. */
function buildCssRotateStyle(box: ViewportBox): CSSProperties {
  return {
    position: 'fixed',
    top: box.top + box.height / 2,
    left: box.left + box.width / 2,
    width: box.height,
    height: box.width,
    transform: 'translate(-50%, -50%) rotate(90deg)',
    zIndex: 100,
  };
}

/** Web — viewport already landscape; fill without a second rotate. */
function buildOsLandscapeStyle(box: ViewportBox): CSSProperties {
  return {
    position: 'fixed',
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height,
    zIndex: 100,
  };
}

/**
 * 16:9 contain while immersive; fill while portrait.
 * Always the same wrapper so the player fiber (iframe/video) never remounts on Full/tilt/Exit.
 */
function MediaContainFrame({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled]);

  const scale = enabled && box.w > 0 && box.h > 0 ? Math.min(box.w / 16, box.h / 9) : 0;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute"
        style={
          scale > 0
            ? {
                width: 16 * scale,
                height: 9 * scale,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }
            : { inset: 0, width: '100%', height: '100%', left: 0, top: 0, transform: 'none' }
        }
      >
        {children}
      </div>
    </div>
  );
}

type ImmersiveLandscapeStageProps = {
  landscape: boolean;
  /** WebView already landscape (web). Native stays false → CSS rotate. */
  deviceLandscape?: boolean | undefined;
  children: ReactNode;
  onExit: () => void;
  overlay?: ReactNode;
  exitLabel?: string | undefined;
  className?: string | undefined;
  /** Portrait: fill parent instead of `aspect-video`. */
  fill?: boolean | undefined;
};

/** Portrait in-flow card; landscape immersive without remounting children. */
export function ImmersiveLandscapeStage({
  landscape,
  deviceLandscape = false,
  children,
  onExit,
  overlay = null,
  exitLabel = 'Exit',
  className,
  fill = false,
}: ImmersiveLandscapeStageProps) {
  const viewport = useVisualViewportBox(landscape);
  const cssRotate = landscape && !deviceLandscape;
  const landscapeStyle = !landscape
    ? undefined
    : cssRotate
      ? buildCssRotateStyle(viewport)
      : buildOsLandscapeStyle(viewport);

  useEffect(() => {
    if (!landscape) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [landscape]);

  return (
    <div
      role={landscape ? 'dialog' : undefined}
      aria-modal={landscape ? true : undefined}
      aria-label={landscape ? 'Landscape video' : undefined}
      className={cn(
        'relative w-full overflow-hidden bg-black',
        landscape ? 'z-100' : fill ? 'h-full min-h-0' : 'aspect-video',
        className
      )}
      style={landscapeStyle}
    >
      <MediaContainFrame enabled={landscape}>{children}</MediaContainFrame>
      {landscape ? overlay : null}
      {landscape ? (
        <MediaRotateButton onClick={onExit} aria-label={exitLabel} className="absolute top-3 right-4 z-10" />
      ) : null}
    </div>
  );
}
