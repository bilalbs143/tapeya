/**
 * Radix Tooltip - hover tooltip
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const content = 'z-50 overflow-hidden rounded-md border bg-slate-900 px-3 py-1.5 text-sm text-white shadow-md';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export function TooltipContent({ className = '', sideOffset = 4, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content sideOffset={sideOffset} className={`${content} ${className}`} {...props} />
    </TooltipPrimitive.Portal>
  );
}
