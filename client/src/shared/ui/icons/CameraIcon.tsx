import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

/** Classic camera body — add/replace photo affordances. */
export function CameraIcon({ size = 'md', className, strokeWidth = 1.9, ...props }: StrokeIconProps) {
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
      <path d="M4 9.25h2.35l1.4-2.5h8.5l1.4 2.5H20A1.75 1.75 0 0 1 21.75 11v7.25A1.75 1.75 0 0 1 20 20H4a1.75 1.75 0 0 1-1.75-1.75V11A1.75 1.75 0 0 1 4 9.25Z" />
      <circle cx="12" cy="14.25" r="3.15" />
    </svg>
  );
}
