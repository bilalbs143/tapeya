/**
 * Radix ToggleGroup - group of toggle buttons (tab style: dark bg, gold active).
 * type: 'single' | 'multiple'
 */

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

const base = 'inline-flex rounded-md';

/** Tab-style item: rounded-[6px], no border/focus ring, inactive #141412, active gold + black text */
const itemClass =
  'shrink-0 inline-flex items-center justify-center rounded-[6px] border-0 px-4 py-2.5 text-[13px] font-semibold tracking-wide outline-none focus:outline-none focus:ring-0 ring-0 text-white bg-[#141412] transition-colors disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[#DA9811] data-[state=on]:text-black';

export function ToggleGroup({ type = 'single', className = '', ...props }) {
  return <ToggleGroupPrimitive.Root type={type} className={`${base} ${className}`} {...props} />;
}

export function ToggleGroupItem({ className = '', ...props }) {
  return <ToggleGroupPrimitive.Item className={`${itemClass} ${className}`} {...props} />;
}
