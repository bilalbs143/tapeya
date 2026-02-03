/**
 * Radix Checkbox - toggle checkbox input
 */

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

const baseRoot =
  'peer h-4 w-4 shrink-0 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 data-[state=checked]:text-white';
const baseIndicator = 'flex items-center justify-center text-current';

export function Checkbox({ className = '', ...props }) {
  return (
    <CheckboxPrimitive.Root className={`${baseRoot} ${className}`} {...props}>
      <CheckboxPrimitive.Indicator className={baseIndicator}>
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
