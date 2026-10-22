import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function ScoreboardIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M8 9v6M12 9v6M16 9v6" />
    </svg>
  );
}
