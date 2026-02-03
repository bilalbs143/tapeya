'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

const Separator = React.forwardRef(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  ),
);

Separator.displayName = 'Separator';

export { Separator };
