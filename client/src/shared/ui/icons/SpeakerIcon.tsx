import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export type SpeakerIconProps = StrokeIconProps & {
  /** Slash overlay when sound is off. */
  muted?: boolean | undefined;
};

/** Speaker — use `muted` for tap-to-unmute / mute affordances. */
export function SpeakerIcon({ size = 'md', className, strokeWidth = 2, muted = false, ...props }: SpeakerIconProps) {
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
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      {muted ? (
        <path d="m23 9-6 6M17 9l6 6" />
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}
