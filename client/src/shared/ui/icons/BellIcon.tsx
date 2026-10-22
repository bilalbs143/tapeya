import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function BellIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <path d="M18 15.5V10a6 6 0 1 0-12 0v5.5L4.5 18h15z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}
