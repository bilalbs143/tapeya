import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { FieldLabel, FieldMessage } from '@/shared/ui/Field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';

import { COUNTRIES } from '../lib/constants';

type PhoneFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  label?: string | undefined;
  dial: string;
  onDialChange: (dial: string) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** String or rich node (e.g. account-taken → Login link). */
  error?: ReactNode;
  hint?: string | undefined;
  required?: boolean | undefined;
};

/** Phone input — country dial select + national number. */
export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(function PhoneField(
  {
    label = 'Phone Number',
    dial,
    onDialChange,
    value,
    onChange,
    error,
    hint,
    required = false,
    className,
    id: idProp,
    ...props
  },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  const country = COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];
  const msgId = error || hint ? `${id}-msg` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <FieldLabel htmlFor={id} required={required} error={Boolean(error)}>
        {label}
      </FieldLabel>

      <div className="flex gap-2">
        <Select value={dial} onValueChange={onDialChange}>
          <SelectTrigger
            aria-label="Country Code"
            className="bg-surface border-border h-12 w-auto shrink-0 gap-1.5 rounded-panel px-3"
          >
            <span className="text-body-lg leading-none">{country.flag}</span>
            <SelectValue>
              <span className="font-mono text-sm font-bold text-ink">{country.dial}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.dial}>
                <span className="flex items-center gap-2.5">
                  <span className="text-body-lg leading-none">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-dim text-2xs">{c.dial}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          ref={ref}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="300 000 0000"
          value={value}
          onChange={onChange}
          required={required}
          className={cn(
            'bg-surface font-mono h-12 min-w-0 flex-1 rounded-panel border px-3.5 text-body-lg leading-normal font-medium tracking-[.02em] text-ink',
            'placeholder:text-dim focus:outline-2 focus:outline-offset-0',
            error ? 'border-danger focus:outline-danger' : 'border-border focus:outline-brand',
            'disabled:pointer-events-none disabled:opacity-40'
          )}
          {...props}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={msgId}
        />
      </div>

      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});
