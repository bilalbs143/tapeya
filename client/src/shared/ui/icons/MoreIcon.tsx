import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

/** Zero-length round caps so strokeWidth scales the kebab dots. */
export function MoreIcon({ size = 'md', className, strokeWidth = 3, ...props }: StrokeIconProps) {
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
      <path d="M12 5h.01M12 12h.01M12 19h.01" />
    </svg>
  );
}
