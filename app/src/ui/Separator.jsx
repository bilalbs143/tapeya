/**
 * Radix Separator - visual divider
 */

import * as SeparatorPrimitive from '@radix-ui/react-separator';

const base =
  'shrink-0 bg-slate-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px';

export function Separator({ orientation = 'horizontal', decorative = true, className = '', ...props }) {
  return (
    <SeparatorPrimitive.Root orientation={orientation} decorative={decorative} className={`${base} ${className}`} {...props} />
  );
}
