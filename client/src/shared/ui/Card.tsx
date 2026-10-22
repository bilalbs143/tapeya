import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

export type CardProps = ComponentProps<'div'> & {
  navy?: boolean | undefined;
};

export function Card({ className, navy = false, ...props }: CardProps) {
  return (
    <div
      className={cn('border-border rounded-card border text-ink', navy ? 'bg-surface-navy' : 'bg-surface', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  // eslint-disable-next-line jsx-a11y/heading-has-content -- heading text comes from children
  return <h3 className={cn('text-title-sm leading-none font-bold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-muted text-sm', className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2 p-5 pt-0', className)} {...props} />;
}
