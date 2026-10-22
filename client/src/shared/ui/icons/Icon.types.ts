export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export const ICON_SIZE_PX: Record<IconSize, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
};

export type IconProps = {
  size?: IconSize;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
};

/** Per-call-site `strokeWidth` — same glyph, different optical weight. */
export type StrokeIconProps = IconProps & {
  strokeWidth?: number;
};

type IconA11yAttrs = {
  'aria-label'?: string;
  'aria-hidden'?: boolean;
};

/** Decorative unless `aria-label` is set. */
export function iconA11yProps({
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: Pick<IconProps, 'aria-label' | 'aria-hidden'>): IconA11yAttrs {
  if (ariaLabel) {
    const attrs: IconA11yAttrs = { 'aria-label': ariaLabel };
    if (ariaHidden !== undefined) attrs['aria-hidden'] = ariaHidden;
    return attrs;
  }
  return { 'aria-hidden': ariaHidden ?? true };
}
