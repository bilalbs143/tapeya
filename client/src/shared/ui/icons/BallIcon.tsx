import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function BallIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4c2.2 2.4 2.2 13.6 0 16M4.5 9.5c5 1.2 10 1.2 15 0M4.5 14.5c5-1.2 10-1.2 15 0" />
    </svg>
  );
}
