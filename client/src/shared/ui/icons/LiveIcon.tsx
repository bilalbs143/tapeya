import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function LiveIcon({ size = 'md', className, strokeWidth = 2.1, ...props }: StrokeIconProps) {
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
      className={className}
      {...iconA11yProps(props)}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  );
}
