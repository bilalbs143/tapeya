import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

type ThumbsDownIconProps = StrokeIconProps & {
  filled?: boolean | undefined;
};

export function ThumbsDownIcon({
  size = 'md',
  className,
  strokeWidth = 1.8,
  filled = false,
  ...props
}: ThumbsDownIconProps) {
  const px = ICON_SIZE_PX[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className={className}
      {...iconA11yProps(props)}
    >
      <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1zM17 13l-4.2 7.4a1.4 1.4 0 0 1-2.6-.9L11 15H5.7a1.8 1.8 0 0 1-1.75-2.25l1.8-7A1.8 1.8 0 0 1 7.5 4H17z" />
    </svg>
  );
}
