import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function CartIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <path d="M4 8h16l-1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
