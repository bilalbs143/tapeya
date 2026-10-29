import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

/** Portrait frame — reel aspect tip. */
export function AspectPortraitIcon({ size = 'md', className, strokeWidth = 1.8, ...props }: StrokeIconProps) {
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
      <rect x="7" y="3" width="10" height="18" rx="2" />
    </svg>
  );
}
