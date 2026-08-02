const outlineProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/** Lightweight outline SVGs used as text-post background decorations. */
export function BallIcon({ className = '', size = 24, seamColor = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <circle cx="12" cy="12" r="9.25" />
      <path
        d="M7 5.8c1.65 1.65 2.5 3.7 2.5 6.2S8.65 16.55 7 18.2M17 5.8c-1.65 1.65-2.5 3.7-2.5 6.2s.85 4.55 2.5 6.2"
        stroke={seamColor}
        strokeDasharray="1.5 2.25"
      />
    </svg>
  );
}

export function TrophyIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="M7 3h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V3z" />
      <path d="M7 4H4v1a4 4 0 0 0 4 4" />
      <path d="M17 4h3v1a4 4 0 0 1-4 4" />
      <path d="M12 12v3" />
      <path d="M9 20h6M10 15h4l.75 5h-5.5l.75-5z" />
    </svg>
  );
}

export function RibbonIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <circle cx="12" cy="8" r="5.75" />
      <path d="m8.8 12.8-2.3 8.7 5.5-3.1 5.5 3.1-2.3-8.7" />
      <path d="m9.4 8 1.65 1.65L14.8 6" />
    </svg>
  );
}

export function ConfettiIcon({ className = '', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="m4 20 4.6-13.8L17.8 16 4 20zM9 7l8-3M15 9l5-1M16 13l4 2" />
      <path d="m8.2 7.3 8.4 8.4" />
    </svg>
  );
}

export function StadiumLightIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="M8 21V9h8v12M6 21h12M8 12h8" />
      <path d="M10 9V6h4v3M7 3l2 2M17 3l-2 2M12 1v3" />
    </svg>
  );
}

export function SparkleIcon({ className = '', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="m12 2 1.7 7.3L21 11l-7.3 1.7L12 20l-1.7-7.3L3 11l7.3-1.7L12 2z" />
    </svg>
  );
}

export function BatIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="M14.5 3.2 20.8 9.5 10.5 19.8 4.2 13.5 14.5 3.2z" />
      <path d="m4.2 13.5-1.8 1.8 6.3 6.3 1.8-1.8M16.2 5l-10 10" />
    </svg>
  );
}

export function WicketsIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="M6.5 7v14M12 7v14M17.5 7v14M5 4.5h8M11 4.5h8M4 21h16" />
    </svg>
  );
}

export function StarIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="m12 2.7 2.8 5.7 6.3.9-4.55 4.45 1.08 6.25L12 17.05 6.37 20l1.08-6.25L2.9 9.3l6.3-.9L12 2.7z" />
    </svg>
  );
}

export function BoltIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="M13.2 2 5 13h6l-.2 9L19 10h-6l.2-8z" />
    </svg>
  );
}

export function CrownIcon({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...outlineProps}>
      <path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7zM6 21h12" />
    </svg>
  );
}
