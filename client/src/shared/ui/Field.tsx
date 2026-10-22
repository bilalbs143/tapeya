import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { InfoIcon } from '@/shared/ui/icons';

/** Label/control/message wrapper for pickers; render prop passes `id` + a11y ids. */
export type FieldRenderProps = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
};

export type FieldLabelProps = {
  htmlFor?: string | undefined;
  required?: boolean | undefined;
  error?: boolean | undefined;
  counter?: ReactNode;
  className?: string | undefined;
  children?: ReactNode;
};

export function FieldLabel({
  htmlFor,
  required = false,
  error = false,
  counter,
  className,
  children,
}: FieldLabelProps) {
  if (!children && counter == null) return null;

  return (
    <div className={cn('flex items-baseline justify-between gap-2', className)}>
      {children ? (
        <label
          htmlFor={htmlFor}
          className={cn(
            'font-mono text-3xs font-bold tracking-eyebrow uppercase',
            error ? 'text-danger-soft' : 'text-muted'
          )}
        >
          {children}
          {required ? (
            <span className="text-danger-soft ml-1" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : (
        <span />
      )}
      {counter != null ? <span className="font-mono text-dim text-4xs font-medium tabular-nums">{counter}</span> : null}
    </div>
  );
}

export type FieldMessageProps = {
  id?: string | undefined;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string | undefined;
};

export function FieldMessage({ id, error, hint, className }: FieldMessageProps) {
  if (!error && !hint) return null;

  return (
    <span
      id={id}
      role={error ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-1.5 text-2xs leading-relaxed',
        error ? 'text-danger-soft' : 'text-dim',
        className
      )}
    >
      {error ? <InfoIcon className="mt-px h-3 w-3 shrink-0" strokeWidth={2.4} /> : null}
      {error || hint}
    </span>
  );
}

export type FieldProps = Omit<ComponentProps<'div'>, 'children'> & {
  label?: ReactNode;
  hint?: string | undefined;
  /** `| undefined` for exactOptionalPropertyTypes + RHF `?.message`. */
  error?: string | undefined;
  required?: boolean | undefined;
  counter?: ReactNode;
  children?: ReactNode | ((props: FieldRenderProps) => ReactNode);
};

export function Field({
  label,
  hint,
  error,
  required = false,
  counter,
  id: idProp,
  className,
  children,
  ...props
}: FieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const msgId = error || hint ? `${id}-msg` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...props}>
      <FieldLabel htmlFor={id} required={required} error={Boolean(error)} counter={counter}>
        {label}
      </FieldLabel>
      {typeof children === 'function' ? children({ id, describedBy: msgId, invalid: Boolean(error) }) : children}
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
}
