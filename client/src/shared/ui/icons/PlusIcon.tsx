import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function PlusIcon({ size = 'md', className, strokeWidth = 2.4, ...props }: StrokeIconProps) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
