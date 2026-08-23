/**
 * Reusable Button component - Radix Slot-based for composition
 * Use with asChild on Radix triggers: <DropdownMenu.Trigger asChild><Button>Open</Button></DropdownMenu.Trigger>
 */

import { Slot } from '@radix-ui/react-slot';

import { Loader } from '@/ui/Loader';

// Variants with a dark/near-black fill need a white ring; everything else (gold/light fills) needs
// the dark "ink" ring. `danger`'s muted red-on-dark fill reads the same way as dark.
const DARK_FILL_VARIANTS = new Set(['dark', 'danger']);

const variants = {
  file: 'border border-[#FFB800] text-[#FFB800] bg-transparent hover:bg-transparent active:bg-transparent',
  /** Brand-gold outline — bordered secondary action (e.g. "View Details" beside a primary CTA) */
  outline: 'rounded-[6px] border-2 border-brand bg-transparent text-brand hover:bg-brand/10 active:opacity-90',
  /** Dashboard tile — square icon+label card; pair with `size="card"` */
  card: 'bg-surface text-muted',
  /** Light grey/off-white background, dark text – e.g. Save Fixture */
  fixture: 'rounded-[6px] bg-[#E8EAFC] font-medium text-ink transition-opacity hover:opacity-95 active:opacity-90',
  /** Brand-gold primary action – forms, CTAs, login/register, start match, etc. */
  orange: 'rounded-[6px] bg-brand font-bold text-ink transition-opacity hover:opacity-95 active:opacity-90',
  /** Scoring tab overlay – e.g. Add Batsman / Add Bowler table button */
  dark: 'rounded-[6px] bg-[#080807] text-white transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none ',
  /** Destructive action – e.g. Cancel Order, Withdraw Interest. Muted/bordered, not a solid fill. */
  danger:
    'rounded-[6px] border border-red-500/40 bg-red-950/30 font-semibold text-red-300 transition-colors hover:bg-red-950/40 active:opacity-90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'h-[45px] px-4 text-base',
  /** Dialog full-width primary – py-3, text-[14px] */
  dialog: 'w-full py-3 text-[14px] font-bold tracking-wide',
  /** Square icon-only button */
  icon: 'h-10 w-10 shrink-0 px-0 py-0',
  /** Dashboard tile — icon + label stacked vertically, fixed footprint */
  card: 'h-[120px] w-[158px] flex-col gap-3 rounded-[18px] px-0 py-0',
};

/**
 * Pass `loading` for async actions — renders a small `<Loader>` next to the label
 * (tone auto-picked from `variant` so it reads against the button's fill). Ignored when
 * `asChild` is set, since Radix `Slot` requires exactly one child element to clone onto.
 */
export function Button({
  children,
  variant = 'orange',
  size = 'md',
  className = '',
  disabled = false,
  asChild = false,
  loading = false,
  ...props
}) {
  const Comp = asChild ? Slot : 'button';
  const showSpinner = loading && !asChild;
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      disabled={disabled}
      className={`inline-flex cursor-pointer touch-manipulation items-center justify-center font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {showSpinner ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader size="xs" tone={DARK_FILL_VARIANTS.has(variant) ? 'light' : 'ink'} />
          {children}
        </span>
      ) : (
        children
      )}
    </Comp>
  );
}
