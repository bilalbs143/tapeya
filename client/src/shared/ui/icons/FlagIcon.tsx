import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function FlagIcon({ size = 'md', className, strokeWidth = 2, ...props }: StrokeIconProps) {
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
      <path d="M5 21V4h9l-1 3h6l-1 4 1 4h-8l1-3H5" />
    </svg>
  );
}
