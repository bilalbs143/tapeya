import type { ComponentProps, ReactNode } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/ui/icons';

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** Mixed state for a "select all" header — maps to Radix's `indeterminate`. */
  indeterminate?: boolean | undefined;
};

export function Checkbox({ className, indeterminate = false, checked, ...props }: CheckboxProps) {
  const state = indeterminate ? ('indeterminate' as const) : checked;

  return (
    <CheckboxPrimitive.Root
      className={cn(
        'border-border data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand focus-visible:outline-brand grid h-[18px] w-[18px] shrink-0 place-items-center rounded-chip border-[1.5px] focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      /* Spread avoids passing `checked={undefined}` under exactOptionalPropertyTypes. */
      {...(state === undefined ? {} : { checked: state })}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        {indeterminate ? (
          <span className="h-0.5 w-2.5 rounded-full bg-white" />
        ) : (
          <CheckIcon className="h-3 w-3 text-white" strokeWidth={3.5} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export type CheckboxRowProps = Omit<CheckboxProps, 'className'> & {
  label: ReactNode;
  description?: ReactNode;
  className?: string | undefined;
};

export function CheckboxRow({ label, description, className, ...props }: CheckboxRowProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 py-2', className)}>
      <Checkbox className="mt-0.5" {...props} />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-tight font-semibold text-ink">{label}</span>
        {description ? <span className="text-muted text-2xs leading-relaxed">{description}</span> : null}
      </span>
    </label>
  );
}
