import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export type CameraFacing = 'front' | 'back';

export type CameraFacingIconProps = StrokeIconProps & {
  /** Which lens is active — front (selfie) vs back (main). */
  facing?: CameraFacing | undefined;
};

/** Distinct front/back camera glyphs for the go-live flip control. */
export function CameraFacingIcon({
  size = 'md',
  className,
  strokeWidth = 1.75,
  facing = 'front',
  ...props
}: CameraFacingIconProps) {
  const px = ICON_SIZE_PX[size];
  const a11y = iconA11yProps(props);

  if (facing === 'back') {
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
        {...a11y}
      >
        <path d="M4 8.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5" />
        <path d="M8 8.5h2.2l1.3-2h3l1.3 2H18" />
        <circle cx="12" cy="13" r="3.25" />
        <path d="M17.5 9.5h.01" strokeWidth={2.5} />
      </svg>
    );
  }

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
      {...a11y}
    >
      <rect x="7" y="4" width="10" height="16" rx="2.5" />
      <circle cx="12" cy="10" r="2.75" />
      <path d="M10 16.5h4" opacity="0.85" />
      <path d="M12 6.5v1.2" opacity="0.65" />
    </svg>
  );
}
