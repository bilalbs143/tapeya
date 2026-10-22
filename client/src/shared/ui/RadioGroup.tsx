import type { ComponentProps, ReactNode } from 'react';
import * as RadioPrimitive from '@radix-ui/react-radio-group';

import { cn } from '@/shared/lib/cn';

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props} />;
}

export type RadioItemProps = Omit<ComponentProps<typeof RadioPrimitive.Item>, 'className'> & {
  description?: ReactNode;
  className?: string | undefined;
  children?: ReactNode;
};

export function RadioItem({ className, children, description, ...props }: RadioItemProps) {
  return (
    <label
      className={cn(
        'bg-surface border-border flex cursor-pointer items-start gap-3 rounded-field border p-3',
        'has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand/10',
        className
      )}
    >
      <RadioPrimitive.Item
        className="border-border data-[state=checked]:border-brand focus-visible:outline-brand mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] focus-visible:outline-2 focus-visible:outline-offset-2"
        {...props}
      >
        <RadioPrimitive.Indicator className="bg-brand h-2.5 w-2.5 rounded-full" />
      </RadioPrimitive.Item>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-tight font-semibold text-ink">{children}</span>
        {description ? <span className="text-muted text-2xs leading-relaxed">{description}</span> : null}
      </span>
    </label>
  );
}

/** Uncarded control for dense lists. */
export function Radio({ className, ...props }: ComponentProps<typeof RadioPrimitive.Item>) {
  return (
    <RadioPrimitive.Item
      className={cn(
        'border-border data-[state=checked]:border-brand focus-visible:outline-brand grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] focus-visible:outline-2 focus-visible:outline-offset-2',
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="bg-brand h-2.5 w-2.5 rounded-full" />
    </RadioPrimitive.Item>
  );
}
