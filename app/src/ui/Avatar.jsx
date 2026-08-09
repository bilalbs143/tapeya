/**
 * Radix Avatar - user profile image with fallback
 */

import * as AvatarPrimitive from '@radix-ui/react-avatar';

const baseRoot = 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full';
const baseImage = 'aspect-square h-full w-full object-cover object-top';
const baseFallback = 'flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-sm font-medium';

export function Avatar({ className = '', children, ...props }) {
  return (
    <AvatarPrimitive.Root className={`${baseRoot} ${className}`} {...props}>
      {children}
    </AvatarPrimitive.Root>
  );
}

export function AvatarImage({ className = '', ...props }) {
  return <AvatarPrimitive.Image className={`${baseImage} ${className}`} {...props} />;
}

export function AvatarFallback({ className = '', children, ...props }) {
  return (
    <AvatarPrimitive.Fallback className={`${baseFallback} ${className}`} {...props}>
      {children}
    </AvatarPrimitive.Fallback>
  );
}
