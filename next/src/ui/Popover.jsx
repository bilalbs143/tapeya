'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/lib/cn';

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;

export const PopoverContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground z-50 w-64 rounded-xl border p-4 shadow-md outline-none',
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  ),
);

PopoverContent.displayName = 'PopoverContent';
