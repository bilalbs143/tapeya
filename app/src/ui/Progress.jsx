/**
 * Radix Progress - progress bar
 * value: 0-max, max: default 100
 */

import * as ProgressPrimitive from '@radix-ui/react-progress';

const root = 'relative h-4 w-full overflow-hidden rounded-full bg-slate-200';
const indicator =
  'h-full bg-indigo-600 transition-all duration-300 ease-in-out';

export function Progress({ className = '', value, max = 100, ...props }) {
  const percentage =
    value != null ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <ProgressPrimitive.Root
      value={value}
      max={max}
      className={`${root} ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={indicator}
        style={{ width: `${percentage}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
