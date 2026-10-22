import type { ElementType, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type SectionLabelProps = {
  /** Pass `as="h2"` when the label titles a landmark section. */
  as?: ElementType | undefined;
  children: ReactNode;
  action?: ReactNode;
  className?: string | undefined;
};

/** Mono section eyebrow — optional action on the right. */
export function SectionLabel({ as: Comp = 'span', children, action, className }: SectionLabelProps) {
  return (
    <div className={cn('flex items-baseline gap-2 pb-2', className)}>
      <Comp className="text-muted font-mono flex-1 text-3xs font-bold tracking-eyebrow uppercase">{children}</Comp>
      {action}
    </div>
  );
}
