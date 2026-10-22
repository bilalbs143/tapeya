import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function RefreshIcon({ size = 'md', className, strokeWidth = 2, ...props }: StrokeIconProps) {
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
      <path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5" />
    </svg>
  );
}
