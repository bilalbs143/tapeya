import type { ComponentProps, ReactNode } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/shared/lib/cn';

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'bg-border data-[state=checked]:bg-brand focus-visible:outline-brand relative h-5 w-[34px] shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="bg-muted data-[state=checked]:bg-white block h-4 w-4 translate-x-0.5 rounded-full transition-transform data-[state=checked]:translate-x-[16px]" />
    </SwitchPrimitive.Root>
  );
}

export type SwitchRowProps = Omit<ComponentProps<typeof SwitchPrimitive.Root>, 'className'> & {
  label: ReactNode;
  description?: ReactNode;
  className?: string | undefined;
};

export function SwitchRow({ label, description, className, ...props }: SwitchRowProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3 py-2.5', className)}>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {description ? <span className="text-muted text-2xs leading-relaxed">{description}</span> : null}
      </span>
      <Switch {...props} />
    </label>
  );
}
