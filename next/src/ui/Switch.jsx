'use client';

import * as RadixSwitch from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/cn';

export const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <RadixSwitch.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
      'bg-muted data-[state=checked]:bg-primary dark:bg-zinc-700',
      className,
    )}
    {...props}
  >
    <RadixSwitch.Thumb className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-200 data-[state=checked]:translate-x-5" />
  </RadixSwitch.Root>
));

Switch.displayName = 'Switch';
