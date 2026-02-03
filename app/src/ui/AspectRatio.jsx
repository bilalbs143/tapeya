/**
 * Radix AspectRatio - maintain aspect ratio of content
 */

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

export function AspectRatio({
  ratio = 16 / 9,
  className = '',
  children,
  ...props
}) {
  return (
    <AspectRatioPrimitive.Root
      ratio={ratio}
      className={`relative w-full overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </AspectRatioPrimitive.Root>
  );
}
