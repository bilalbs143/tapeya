import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

type HeartIconProps = StrokeIconProps & {
  filled?: boolean | undefined;
};

export function HeartIcon({ size = 'md', className, strokeWidth = 1.9, filled = false, ...props }: HeartIconProps) {
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
      <path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.6c0 5-7 9.4-7 9.4z" />
    </svg>
  );
}
