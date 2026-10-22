import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export function DrawerIcon({
  children,
  className,
  strokeWidth = 1.9,
}: {
  children: ReactNode;
  className?: string | undefined;
  strokeWidth?: number | undefined;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-[19px] w-[19px] shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
