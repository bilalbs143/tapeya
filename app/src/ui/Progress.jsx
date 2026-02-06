/**
 * Radix Progress - progress bar
 * value: 0-max, max: default 100
 */

import * as ProgressPrimitive from '@radix-ui/react-progress';

const root = 'relative h-[4px] w-full overflow-hidden rounded-full bg-[#FFFFFF24]';
const indicator =
  'h-full bg-[#DA9811] transition-all duration-300 ease-in-out';

export function Progress({
  className = '',
  indicatorClassName = '',
  value,
  max = 100,
  ...props
}) {
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
        className={`${indicator} ${indicatorClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
