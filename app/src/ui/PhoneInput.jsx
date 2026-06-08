import { forwardRef, useCallback, useState } from 'react';

import { getCountryFromDialDigits, getFlagEmoji, parseE164Phone } from '@/lib/phoneCodes';
import { CountryPickerSheet } from '@/ui/CountryPickerSheet';

const ring = {
  default: 'focus-within:ring-2 focus-within:ring-[#FF9700]/50',
  error: 'focus-within:ring-2 focus-within:ring-red-500/50',
};

const WRAPPER = 'flex w-full overflow-hidden rounded-[6px] bg-surface transition-colors';

const BADGE_BTN =
  'flex h-12 shrink-0 items-center gap-1.5 border-r border-white/10 pl-3 pr-2.5 text-white transition-colors hover:bg-white/5 active:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF9700]/60';

const NUMBER_INPUT =
  'h-12 min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] text-white placeholder:text-muted/47 focus:outline-none';

export const PhoneInput = forwardRef(function PhoneInput(
  { className = '', error, value = '', onChange, id, name, placeholder, readOnly = false, ...props },
  ref,
) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const { dialCode, subscriber } = parseE164Phone(value);
  const iso = getCountryFromDialDigits(dialCode) ?? 'PK';
  const flag = getFlagEmoji(iso);

  const handleSubscriberChange = useCallback(
    (e) => {
      if (readOnly) return;
      let sub = e.target.value.replace(/\D/g, '');
      if (sub.startsWith('0')) sub = sub.slice(1);
      onChange(`+${dialCode}${sub}`);
    },
    [dialCode, onChange, readOnly],
  );

  const handleCountrySelect = useCallback(
    (newDialCode) => {
      if (readOnly) return;
      onChange(`+${newDialCode}${subscriber}`);
    },
    [subscriber, onChange, readOnly],
  );

  return (
    <div className="flex w-full flex-col gap-1">
      <div className={`${WRAPPER} ${error ? ring.error : ring.default} ${readOnly ? 'opacity-90' : ''} ${className}`.trim()}>
        <button
          type="button"
          aria-label={readOnly ? `Country code +${dialCode}` : `Country code +${dialCode}. Tap to change.`}
          aria-haspopup={readOnly ? undefined : 'dialog'}
          aria-expanded={readOnly ? undefined : pickerOpen}
          onClick={() => {
            if (!readOnly) setPickerOpen(true);
          }}
          disabled={readOnly}
          className={`${BADGE_BTN} ${readOnly ? 'cursor-default opacity-80 hover:bg-transparent active:bg-transparent' : ''}`}
          tabIndex={readOnly ? -1 : 0}
        >
          <span className="text-xl leading-none" aria-hidden>
            {flag}
          </span>
          <span className="text-[14px] font-medium text-[#E0E0E0] tabular-nums">+{dialCode}</span>
          {!readOnly && (
            <svg width={10} height={10} viewBox="0 0 10 10" fill="currentColor" className="text-muted" aria-hidden>
              <path
                d="M1 3l4 4 4-4"
                stroke="currentColor"
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <input
          ref={ref}
          id={id}
          name={name}
          type="tel"
          inputMode={readOnly ? undefined : 'numeric'}
          autoComplete="tel-national"
          value={subscriber}
          onChange={handleSubscriberChange}
          placeholder={placeholder ?? 'Enter phone number'}
          className={`${NUMBER_INPUT} ${readOnly ? 'cursor-default text-[#E0E0E0]/90' : ''}`}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          {...props}
        />
      </div>

      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      {!readOnly && (
        <CountryPickerSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          currentDialCode={dialCode}
          onSelect={handleCountrySelect}
        />
      )}
    </div>
  );
});
