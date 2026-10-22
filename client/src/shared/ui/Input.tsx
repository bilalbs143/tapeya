import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { FieldLabel, FieldMessage } from '@/shared/ui/Field';
import { CheckIcon } from '@/shared/ui/icons';

/** `error`/`hint` use `| undefined` for exactOptionalPropertyTypes + RHF messages. */
type SharedFieldProps = {
  label?: string | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  valid?: boolean | undefined;
};

export type InputProps = InputHTMLAttributes<HTMLInputElement> & SharedFieldProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    hint,
    error,
    valid = false,
    required = false,
    id: idProp,
    disabled,
    maxLength,
    value,
    defaultValue,
    ...props
  },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  const showValid = valid && !error && !disabled;
  const len = String(value ?? defaultValue ?? '').length;
  const msgId = error || hint ? `${id}-msg` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        htmlFor={id}
        required={required}
        error={Boolean(error)}
        counter={maxLength != null ? `${len} / ${maxLength}` : undefined}
      >
        {label}
      </FieldLabel>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'bg-surface h-11 w-full rounded-field border px-3 text-sm font-medium text-ink',
            'placeholder:text-muted/80 focus:outline-2 focus:outline-offset-0',
            showValid && 'pr-10',
            error
              ? 'border-danger bg-surface focus:outline-danger'
              : disabled
                ? 'border-border bg-page-deep border-dashed text-dim'
                : 'border-border bg-surface focus:outline-brand',
            'disabled:pointer-events-none disabled:opacity-100',
            className
          )}
          {...props}
          aria-invalid={error ? true : undefined}
          aria-describedby={msgId}
          aria-required={required || undefined}
        />
        {showValid ? (
          <span className="bg-positive absolute top-1/2 right-2.5 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-white">
            <CheckIcon className="h-3 w-3" strokeWidth={3.2} />
          </span>
        ) : null}
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, required = false, id: idProp, maxLength, value, defaultValue, ...props },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  const len = String(value ?? defaultValue ?? '').length;
  const msgId = error || hint ? `${id}-msg` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        htmlFor={id}
        required={required}
        error={Boolean(error)}
        counter={maxLength != null ? `${len} / ${maxLength}` : undefined}
      >
        {label}
      </FieldLabel>
      <textarea
        ref={ref}
        id={id}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        required={required}
        className={cn(
          'bg-surface min-h-[88px] w-full resize-none rounded-field border p-3 text-sm leading-relaxed font-medium text-ink',
          'placeholder:text-muted/80 focus:outline-2 focus:outline-offset-0',
          error ? 'border-danger focus:outline-danger' : 'border-border focus:outline-brand',
          'disabled:border-border disabled:bg-page-deep disabled:border-dashed disabled:text-dim',
          className
        )}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={msgId}
        aria-required={required || undefined}
      />
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});
