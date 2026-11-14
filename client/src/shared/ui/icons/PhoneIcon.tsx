import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

/** Handset — locked account phone rows. */
export function PhoneIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <path d="M8.2 3.75h2.05l1.1 3.35-1.35 1.1a12.4 12.4 0 0 0 5.8 5.8l1.1-1.35 3.35 1.1v2.05a1.85 1.85 0 0 1-1.85 1.85A15.4 15.4 0 0 1 3.35 5.6 1.85 1.85 0 0 1 5.2 3.75Z" />
    </svg>
  );
}
