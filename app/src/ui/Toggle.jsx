/**
 * Radix Toggle - toggle button (pressed state)
 */

import * as TogglePrimitive from '@radix-ui/react-toggle';

const base =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900';

export function Toggle({ className = '', ...props }) {
  return <TogglePrimitive.Root className={`${base} ${className}`} {...props} />;
}
