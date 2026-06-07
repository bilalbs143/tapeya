/**
 * Radix Switch — toggle switch.
 */

import * as SwitchPrimitive from '@radix-ui/react-switch';

const root =
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#DA9811] data-[state=unchecked]:bg-[#3B3B35]';
const thumb =
  'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0';

export function Switch({ className = '', ...props }) {
  return (
    <SwitchPrimitive.Root className={`${root} ${className}`} {...props}>
      <SwitchPrimitive.Thumb className={thumb} />
    </SwitchPrimitive.Root>
  );
}
