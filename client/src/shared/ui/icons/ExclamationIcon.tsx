import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function ExclamationIcon({ size = 'md', className, strokeWidth = 2.6, ...props }: StrokeIconProps) {
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
      <path d="M12 7v6M12 16.5v.5" />
    </svg>
  );
}
