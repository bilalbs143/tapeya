import type { ComponentProps } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/shared/lib/cn';

export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor {...props} />;
}

export type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content>;

export function PopoverContent({ className, sideOffset = 6, align = 'start', ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'bg-surface border-border z-50 overflow-hidden rounded-panel border text-ink shadow-pop outline-none',
          'data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export function PopoverClose(props: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close {...props} />;
}
