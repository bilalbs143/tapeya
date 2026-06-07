/**
 * Radix Checkbox — gold primary on dark surfaces (dialogs, scoring, forms).
 */

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

const root =
  'peer inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[#2A2A28] bg-[#141412] text-[#080807] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#DA9811]/45 data-[state=checked]:border-[#DA9811] data-[state=checked]:bg-[#DA9811]';

const indicator = 'flex items-center justify-center text-current';

export function Checkbox({ className = '', ...props }) {
  return (
    <CheckboxPrimitive.Root className={`${root} ${className}`} {...props}>
      <CheckboxPrimitive.Indicator className={indicator}>
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
