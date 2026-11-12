import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { FieldLabel, FieldMessage } from '@/shared/ui/Field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';

import { COUNTRIES, countryByCode } from '../lib/constants';
import { clampNational } from '../lib/phone';

type PhoneFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'placeholder' | 'maxLength'
> & {
  label?: string | undefined;
  /** ISO 3166-1 alpha-2 — Select value (allows US + CA both on `+1`). */
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  value: string;
  onNationalChange: (national: string) => void;
  /** String or rich node (e.g. account-taken → Login link). */
  error?: ReactNode;
  hint?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Phone input — country select + national number (placeholder/length follow country). */
export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(function PhoneField(
  {
    label = 'Phone Number',
    countryCode,
    onCountryCodeChange,
    value,
    onNationalChange,
    error,
    hint,
    required = false,
    disabled = false,
    className,
    id: idProp,
    ...props
  },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  const country = countryByCode(countryCode);
  const msgId = error || hint ? `${id}-msg` : undefined;

  function handleCountryChange(nextCode: string) {
    onCountryCodeChange(nextCode);
    const next = clampNational(value, nextCode);
    if (next !== value) onNationalChange(next);
  }

  function handleNationalChange(e: React.ChangeEvent<HTMLInputElement>) {
    onNationalChange(clampNational(e.target.value, countryCode));
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <FieldLabel htmlFor={id} required={required} error={Boolean(error)}>
        {label}
      </FieldLabel>

      <div className="flex gap-2">
        <Select value={country.code} onValueChange={handleCountryChange} disabled={disabled}>
          <SelectTrigger
            aria-label="Country Code"
            disabled={disabled}
            className="bg-surface border-border h-12 w-auto shrink-0 gap-1.5 rounded-panel px-3"
          >
            <span className="text-body-lg leading-none">{country.flag}</span>
            <SelectValue>
              <span className="font-mono text-sm font-bold text-ink">{country.dial}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
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
          inputMode="numeric"
          autoComplete="tel-national"
          {...props}
          placeholder={country.placeholder}
          maxLength={country.nsnMax}
          value={value}
          onChange={handleNationalChange}
          required={required}
          disabled={disabled}
          className={cn(
            'bg-surface font-mono h-12 min-w-0 flex-1 rounded-panel border px-3.5 text-body-lg leading-normal font-medium tracking-[.02em] text-ink',
            'placeholder:text-dim focus:outline-2 focus:outline-offset-0',
            error ? 'border-danger focus:outline-danger' : 'border-border focus:outline-brand',
            'disabled:pointer-events-none disabled:opacity-40'
          )}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={msgId}
        />
      </div>

      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});
