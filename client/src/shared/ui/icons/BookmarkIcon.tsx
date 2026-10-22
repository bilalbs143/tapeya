import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

type BookmarkIconProps = StrokeIconProps & {
  filled?: boolean | undefined;
};

export function BookmarkIcon({
  size = 'md',
  className,
  strokeWidth = 1.9,
  filled = false,
  ...props
}: BookmarkIconProps) {
  const px = ICON_SIZE_PX[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={className}
      {...iconA11yProps(props)}
    >
      <path d="M6 3h12v18l-6-4.5L6 21z" />
    </svg>
  );
}
