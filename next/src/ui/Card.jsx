import React from 'react';

import { cn } from '@/lib/cn';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-2xl border p-4 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
