import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function WifiOffIcon({ size = 'md', className, strokeWidth = 2.2, ...props }: StrokeIconProps) {
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
      <path d="M3 3l18 18" />
      <path d="M5 12.5a10 10 0 0 1 5-2.4" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}
