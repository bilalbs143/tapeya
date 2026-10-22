import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function FilmIcon({ size = 'md', className, strokeWidth = 1.8, ...props }: StrokeIconProps) {
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
      <path d="M4 3h16v18H4zM4 8h16M9 3l2 5M15 3l2 5" />
    </svg>
  );
}
