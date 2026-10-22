import type { ComponentProps } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/shared/lib/cn';

type ScrubberProps = Omit<ComponentProps<typeof SliderPrimitive.Root>, 'value' | 'onValueChange'> & {
  value: number;
  onValueChange: (value: number) => void;
  previewLabel?: string | undefined;
  scrubbing?: boolean | undefined;
};

/** Controlled media scrubber — parent owns seek/time sync. */
export function Scrubber({
  value,
  onValueChange,
  previewLabel,
  scrubbing = false,
  className,
  ...props
}: ScrubberProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('relative', className)}>
      {scrubbing && previewLabel ? (
        <div className="pointer-events-none absolute -top-6 z-10 -translate-x-1/2" style={{ left: `${clamped}%` }}>
          <span className="rounded-full bg-black/55 px-2 py-0.5 font-mono text-4xs font-bold text-white">
            {previewLabel}
          </span>
        </div>
      ) : null}

      <SliderPrimitive.Root
        value={[clamped]}
        onValueChange={(next) => onValueChange(next[0] ?? 0)}
        max={100}
        step={0.1}
        aria-label="Seek"
        className={cn(
          'relative flex h-3 w-full touch-none items-center select-none',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-40'
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden rounded-full bg-white/25">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-white" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-3 w-3 rounded-full bg-white',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
            scrubbing ? 'scale-125 opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            'transition-[transform,opacity]'
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}
