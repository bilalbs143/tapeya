import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export function BatIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <path d="M6 21V8a6 6 0 0 1 12 0v13" />
      <path d="M4 21h16" />
    </svg>
  );
}
