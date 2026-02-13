/** Phone input: flag from country code, "+" and digits in field. Use with Controller. */

import { forwardRef, useCallback } from 'react';

import { getCountryFromDialDigits, getFlagEmoji } from '@/lib/phoneCodes';

const ring = {
  default: 'focus-within:ring-2 focus-within:ring-[#FF9700]/50',
  error: 'focus-within:ring-2 focus-within:ring-red-500/50',
};

const inputClass =
  'h-12 min-w-0 flex-1 bg-transparent px-2 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none';

export const PhoneInput = forwardRef(function PhoneInput(
  {
    className = '',
    error,
    value = '',
    onChange,
    id,
    name,
    placeholder,
    ...props
  },
  ref,
) {
  const digits = value?.startsWith('+')
    ? value.slice(1).replace(/\D/g, '')
    : (value || '').replace(/\D/g, '');
  const resolvedCountry = getCountryFromDialDigits(digits);
  const country = resolvedCountry ?? 'PK'; // Always show a flag so the input doesn't shift
  const display = value === '' ? '+92' : value;

  const handleChange = useCallback(
    (e) => onChange('+' + (e.target.value.replace(/\D/g, '') || '')),
    [onChange],
  );

  return (
    <div className="flex w-full flex-col gap-1">
      <div
        className={`flex w-full overflow-hidden rounded-[160px] bg-[#141412] transition-colors ${error ? ring.error : ring.default}`}
      >
        <span
          className="flex h-12 w-10 shrink-0 items-center justify-center pl-2 text-white"
          aria-hidden
        >
          <span className="text-xl leading-none">{getFlagEmoji(country)}</span>
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={display}
          onChange={handleChange}
          placeholder={placeholder ?? 'Enter Phone Number'}
          className={`${inputClass} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          id={id}
          name={name}
          {...props}
        />
      </div>
      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});
