/**
 * Reusable Button component - Radix Slot-based for composition
 * Use with asChild on Radix triggers: <DropdownMenu.Trigger asChild><Button>Open</Button></DropdownMenu.Trigger>
 */

import { Slot } from '@radix-ui/react-slot';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
  secondary:
    'bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400',
  outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  ghost: 'text-indigo-600 hover:bg-indigo-50',
  file: 'border border-[#FFB800] text-[#FFB800] bg-transparent hover:bg-transparent active:bg-transparent',
  card: 'bg-[#EBF2FF] text-[#A2A6AB]',
  auth: 'h-12 w-[358px] max-w-full rounded-[6px] bg-[#DA9811] font-bold text-[#080807] transition-opacity hover:opacity-95 active:opacity-90',
  /** Light grey/off-white background, dark text – e.g. Save Fixture */
  fixture: 'rounded-[6px] bg-[#e8eafc] font-medium text-[#080807] transition-opacity hover:opacity-95 active:opacity-90',
  /** Orange primary action – e.g. Start Match */
  orange: 'rounded-[6px] bg-[#DA9811] font-bold text-[#080807] transition-opacity hover:opacity-95 active:opacity-90',
  /** Scoring tab overlay – e.g. Add Batsman / Add Bowler table button */
  dark: 'rounded-[17px] bg-[#080807] text-white transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none ',
  /** Unselected role toggle – e.g. Playing / Bench when inactive */
  black: 'rounded-[6px] bg-black text-white transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none',
  /** Dialog primary – e.g. Create New (orange, dark text) */
  orangeDialog: 'rounded-[6px] bg-[#DA9811] !capitalize font-bold text-[#080807] transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none',
  /** Dialog primary with white text – e.g. Add Batsman / Add Bowler submit */
  orangeDialogWhite: 'rounded-[6px] !capitalize bg-[#DA9811] font-bold transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none ',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  /** Dialog full-width primary – py-3, text-[14px] */
  dialog: 'w-full py-3 text-[14px] font-bold uppercase tracking-wide',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      disabled={disabled}
      className={`inline-flex cursor-pointer touch-manipulation items-center justify-center font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
