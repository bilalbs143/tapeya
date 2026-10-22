import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export type MicIconProps = StrokeIconProps & {
  /** Slash overlay when the mic is muted. */
  muted?: boolean | undefined;
};

/** Microphone — use `muted` for the go-live mute affordance. */
export function MicIcon({ size = 'md', className, strokeWidth = 1.75, muted = false, ...props }: MicIconProps) {
  const px = ICON_SIZE_PX[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...iconA11yProps(props)}
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      {muted ? <path d="m4 4 16 16" strokeWidth={2} /> : null}
    </svg>
  );
}
