import { ICON_SIZE_PX, iconA11yProps, type IconProps } from './Icon.types';

export function PlayFillIcon({ size = 'md', className, ...props }: IconProps) {
  const px = ICON_SIZE_PX[size];
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill="currentColor" className={className} {...iconA11yProps(props)}>
      <path d="M8 5l11 7-11 7z" />
    </svg>
  );
}
