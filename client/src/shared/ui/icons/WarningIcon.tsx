import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function WarningIcon({ size = 'md', className, strokeWidth = 2.4, ...props }: StrokeIconProps) {
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
      <path d="M12 8v5M12 16.5v.5" />
      <path d="M10.2 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.8 4.8a2 2 0 0 0-3.6 0z" />
    </svg>
  );
}
