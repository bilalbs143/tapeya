import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function CloseIcon({ size = 'md', className, strokeWidth = 2.2, ...props }: StrokeIconProps) {
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
