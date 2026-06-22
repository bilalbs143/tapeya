import { AnimatedNumber, Crest, GlowPanel } from './atoms';
import { TeamLogoOrCrest } from './fs-kit';

/**
 * GlowPanel on air; plain flex shell when measuring (no blur, ring, or ambient side effects).
 */
export function InsetLTBarPanel({ measuring, radius, accent, className, style, children, hideRing = true }) {
  if (measuring) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <GlowPanel hideRing={hideRing} radius={radius} accent={accent} className={className} style={style}>
      {children}
    </GlowPanel>
  );
}

/** Crest on air; fixed-size block when measuring so column width stays accurate. */
export function InsetLTCrest({ measuring, size, ...crestProps }) {
  if (measuring) {
    return <span aria-hidden className="block shrink-0" style={{ width: size, height: size }} />;
  }

  return <Crest size={size} {...crestProps} />;
}

/** Team logo / crest on air; fixed-size block when measuring. */
export function InsetLTTeamMark({ measuring, size, ...markProps }) {
  if (measuring) {
    return <span aria-hidden className="block shrink-0" style={{ width: size, height: size }} />;
  }

  return <TeamLogoOrCrest size={size} {...markProps} />;
}

/** Logo image on air; square placeholder when measuring (avoids duplicate fetch). */
export function InsetLTLogo({ measuring, height, width, alt = '', className, style, ...imgProps }) {
  if (measuring) {
    const w = width ?? height;
    return <span aria-hidden className="block shrink-0" style={{ width: w, height }} />;
  }

  return <img alt={alt} className={className} style={{ ...style, height }} {...imgProps} />;
}

/** AnimatedNumber on air; static text when measuring (no timers / count-up). */
export function InsetLTAnimatedNumber({ measuring, value, className, style }) {
  if (measuring) {
    return (
      <span className={className} style={style}>
        {value}
      </span>
    );
  }

  return <AnimatedNumber value={value} className={className} style={style} />;
}
