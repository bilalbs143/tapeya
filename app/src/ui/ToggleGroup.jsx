/**
 * Radix ToggleGroup - group of toggle buttons
 * type: 'single' | 'multiple'
 */

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

const base = 'inline-flex rounded-md';

export function ToggleGroup({ type = 'single', className = '', ...props }) {
  return (
    <ToggleGroupPrimitive.Root
      type={type}
      className={`${base} ${className}`}
      {...props}
    />
  );
}

export function ToggleGroupItem({ className = '', ...props }) {
  return (
    <ToggleGroupPrimitive.Item
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-slate-200 ${className}`}
      {...props}
    />
  );
}
