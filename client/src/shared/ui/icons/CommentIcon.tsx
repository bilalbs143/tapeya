import { ICON_SIZE_PX, iconA11yProps, type StrokeIconProps } from './Icon.types';

export type CommentIconProps = StrokeIconProps & {
  /** Slash when comments are hidden (go-live toggle). Base glyph unchanged for feed/reels. */
  off?: boolean | undefined;
};

/** Chat bubble — not the reel comment action glyph. */
export function CommentIcon({ size = 'md', className, strokeWidth = 2, off = false, ...props }: CommentIconProps) {
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
      <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" />
      {off ? <path d="m4 4 16 16" strokeWidth={Math.max(strokeWidth, 2)} /> : null}
    </svg>
  );
}
