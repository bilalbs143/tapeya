/**
 * Radix Label - accessible form label
 */

import * as LabelPrimitive from '@radix-ui/react-label';

const base =
  'text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';

export function Label({ className = '', ...props }) {
  return <LabelPrimitive.Root className={`${base} ${className}`} {...props} />;
}
