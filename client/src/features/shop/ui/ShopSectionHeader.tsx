import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type ShopSectionHeaderProps = {
  title: string;
  action?: ReactNode;
  className?: string | undefined;
};

export function ShopSectionHeader({ title, action, className }: ShopSectionHeaderProps) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <h2 className="font-mono text-xs font-bold tracking-eyebrow text-ink uppercase">{title}</h2>
      {action}
    </div>
  );
}
