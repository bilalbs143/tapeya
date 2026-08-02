import { CRICKET_ICON_MAP } from '@/lib/constants/cricketPatternIconMap';
import { CRICKET_PATTERN_LAYOUTS } from '@/lib/constants/cricketPatternLayouts';

/** Deterministic outline motifs kept around the text-safe edges. */
function CricketIconScatter({ patternId }) {
  const layout = CRICKET_PATTERN_LAYOUTS[patternId];
  if (!layout?.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden>
      {layout.map((item, i) => {
        const Icon = CRICKET_ICON_MAP[item.icon];
        if (!Icon) return null;
        return (
          <span
            key={`${patternId}-${i}`}
            className={`absolute ${item.color ?? 'text-white'}`}
            style={{
              top: item.top,
              left: item.left,
              opacity: item.opacity ?? 0.16,
              transform: `rotate(${item.rotate}deg)`,
            }}
          >
            <Icon size={item.size} seamColor={item.seamColor} />
          </span>
        );
      })}
    </div>
  );
}

/**
 * @param {{
 *   background: { className: string, overlayClassName?: string, pattern?: string },
 *   className?: string,
 *   contentClassName?: string,
 *   rounded?: boolean,
 *   children: import('react').ReactNode,
 * }} props
 */
export default function TextPostBackground({ background, className = '', contentClassName = '', rounded = true, children }) {
  if (!background) return children;

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden ring-1 ring-white/10 ring-inset ${rounded ? 'rounded-2xl' : ''} ${background.className} ${className}`.trim()}
    >
      {background.overlayClassName ? (
        <div className={`pointer-events-none absolute inset-0 ${background.overlayClassName}`} aria-hidden />
      ) : null}
      {background.pattern ? <CricketIconScatter patternId={background.pattern} /> : null}
      <div className={`relative z-10 w-full px-8 py-10 sm:px-12 sm:py-12 ${contentClassName}`.trim()}>{children}</div>
    </div>
  );
}
