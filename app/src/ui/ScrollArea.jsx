/**
 * Radix ScrollArea - custom scrollable area
 */

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

const root = 'relative overflow-hidden';
const viewport = 'h-full w-full rounded-[inherit]';
const scrollbar =
  'flex touch-none select-none transition-colors data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col';
const thumb =
  'relative flex-1 rounded-full bg-slate-300 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[""]';

export function ScrollArea({ className = '', children, ...props }) {
  return (
    <ScrollAreaPrimitive.Root className={`${root} ${className}`} {...props}>
      <ScrollAreaPrimitive.Viewport className={viewport}>{children}</ScrollAreaPrimitive.Viewport>
      <ScrollBar />
    </ScrollAreaPrimitive.Root>
  );
}

export function ScrollBar({ orientation = 'vertical', ...props }) {
  return (
    <ScrollAreaPrimitive.Scrollbar orientation={orientation} className={scrollbar} {...props}>
      <ScrollAreaPrimitive.Thumb className={thumb} />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
