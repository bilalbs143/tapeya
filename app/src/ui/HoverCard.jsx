/**
 * Radix HoverCard - hover-triggered popover
 */

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

const content =
  'z-50 w-64 rounded-md border bg-white p-4 shadow-md outline-none';

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;
export const HoverCardPortal = HoverCardPrimitive.Portal;

export function HoverCardContent({ className = '', sideOffset = 4, ...props }) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        sideOffset={sideOffset}
        className={`${content} ${className}`}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
