import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function ChevronLeftIcon({ size = 'md', className, strokeWidth = 2, ...props }: StrokeIconProps) {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
