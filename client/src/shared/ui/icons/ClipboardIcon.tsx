import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function ClipboardIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <path d="M8 7h8M8 12h8M8 17h5" />
      <path d="M5 4h14v16H5z" />
    </svg>
  );
}
