import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

/** Layout-only — pair with Field/Input/SelectField for labels and errors. */

const FORM_DENSITY = {
  default: 'gap-6',
  compact: 'gap-3.5',
} as const;

export type FormDensity = keyof typeof FORM_DENSITY;

export type FormProps = ComponentProps<'form'> & {
  density?: FormDensity | undefined;
};

export function Form({ className, children, density = 'default', ...props }: FormProps) {
  return (
    <form className={cn('flex flex-col', FORM_DENSITY[density], className)} {...props}>
      {children}
    </form>
  );
}

export type FormSectionProps = ComponentProps<'section'> & {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

/** Titled field group — description stacks under title on narrow screens. */
export function FormSection({ title, description, action, className, children, ...props }: FormSectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)} {...props}>
      {title || action ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-mono text-3xs font-bold tracking-eyebrow text-muted uppercase">{title}</h2>
            ) : null}
            {description ? <p className="text-dim mt-1.5 text-2xs leading-relaxed">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/** Two columns from `tab` up; stacks on phone. */
export function FormRow({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 tab:grid-cols-2', className)} {...props}>
      {children}
    </div>
  );
}

/** Footer actions — full-width on phone, inline from `tab`. */
export function FormActions({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-border-subtle flex items-center gap-2 border-t pt-4 [&>*]:flex-1 tab:justify-end tab:[&>*]:flex-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type DetailSectionProps = ComponentProps<'section'> & {
  title?: ReactNode;
  action?: ReactNode;
};

/** Read-only FormSection-style block for detail screens. */
export function DetailSection({ title, action, className, children, ...props }: DetailSectionProps) {
  return (
    <section className={cn('flex flex-col gap-2.5', className)} {...props}>
      {title || action ? (
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-mono text-3xs font-bold tracking-eyebrow text-muted uppercase">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="border-border-subtle bg-surface rounded-card border">{children}</div>
    </section>
  );
}

export type DetailRowProps = ComponentProps<'div'> & {
  label?: ReactNode;
  value?: ReactNode;
  mono?: boolean | undefined;
};

export function DetailRow({ label, value, mono = true, className, children, ...props }: DetailRowProps) {
  return (
    <div
      className={cn(
        'border-border-subtle flex items-baseline justify-between gap-4 border-t px-3.5 py-2.5 first:border-t-0',
        className
      )}
      {...props}
    >
      <span className="text-muted shrink-0 text-2xs">{label}</span>
      <span className={cn('min-w-0 text-right text-body-sm font-semibold text-ink', mono && 'font-mono tabular-nums')}>
        {children ?? value}
      </span>
    </div>
  );
}
