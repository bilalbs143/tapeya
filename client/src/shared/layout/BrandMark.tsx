import { useTheme } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

type BrandMarkProps = {
  className?: string | undefined;
  /**
   * `auto` follows resolved theme (phone surface bars).
   * `dark` for navy/deep chrome (desk TopBar) — white stem.
   */
  variant?: 'auto' | 'dark' | 'light' | undefined;
};

/** Compact Tapeya T mark for shell chrome — theme pair in `/brand/tapeya-mark-*.png`. */
export function BrandMark({ className, variant = 'auto' }: BrandMarkProps) {
  const { resolved } = useTheme();
  const mode = variant === 'auto' ? resolved : variant;
  const src = mode === 'dark' ? '/brand/tapeya-mark-dark.png' : '/brand/tapeya-mark-light.png';

  return <img src={src} alt="" className={cn('h-8 w-auto object-contain object-left', className)} />;
}
