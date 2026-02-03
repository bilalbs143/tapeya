/**
 * Radix Popover - click-triggered popover
 */

import * as PopoverPrimitive from '@radix-ui/react-popover';

const content =
  'z-50 w-72 rounded-md border bg-white p-4 shadow-md outline-none';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverPortal = PopoverPrimitive.Portal;

export function PopoverContent({ className = '', sideOffset = 4, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={`${content} ${className}`}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export function PopoverClose({ className = '', ...props }) {
  return <PopoverPrimitive.Close className={className} {...props} />;
}
