import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

type ThumbsUpIconProps = StrokeIconProps & {
  filled?: boolean | undefined;
};

export function ThumbsUpIcon({
  size = 'md',
  className,
  strokeWidth = 1.8,
  filled = false,
  ...props
}: ThumbsUpIconProps) {
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
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l4.2-7.4a1.4 1.4 0 0 1 2.6.9L13 9h5.3a1.8 1.8 0 0 1 1.75 2.25l-1.8 7A1.8 1.8 0 0 1 16.5 20H7z" />
    </svg>
  );
}
