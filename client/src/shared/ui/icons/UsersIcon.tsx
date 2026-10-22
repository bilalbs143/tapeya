import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function UsersIcon({ size = 'md', className, strokeWidth = 1.6, ...props }: StrokeIconProps) {
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
      <path d="M16 20v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="9" r="3.2" />
      <path d="M4 20v-1.5a3 3 0 0 1 3-3M20 20v-1.5a3 3 0 0 0-3-3" />
    </svg>
  );
}
