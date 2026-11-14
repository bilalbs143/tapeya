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
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M8.15 7.7a5.5 5.5 0 0 0 0 8.6M15.85 7.7a5.5 5.5 0 0 1 0 8.6" />
      <path d="M5.2 4.9a9.5 9.5 0 0 0 0 14.2M18.8 4.9a9.5 9.5 0 0 1 0 14.2" />
    </svg>
  );
}
