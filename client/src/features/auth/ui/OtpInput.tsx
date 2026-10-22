import { useRef } from 'react';

import { cn } from '@/shared/lib/cn';

import { OTP_LENGTH } from '../lib/constants';

type OtpInputProps = {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  onComplete?: ((value: string) => void) | undefined;
  error?: boolean | undefined;
  disabled?: boolean | undefined;
  length?: number | undefined;
  className?: string | undefined;
  /** Links cells to an error/status message via aria-describedby. */
  describedBy?: string | undefined;
};

/** Four-digit OTP cells — paste/autofill; no mount autofocus. */
export function OtpInput({
  value = '',
  onChange,
  onComplete,
  error = false,
  disabled = false,
  length = OTP_LENGTH,
  className,
  describedBy,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange?.(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const clearAt = (i: number) => {
    const chars = value.padEnd(length, ' ').split('');
    if (chars[i] !== ' ' && chars[i] !== undefined) {
      chars[i] = ' ';
      onChange?.(chars.join('').trimEnd().replace(/ /g, ''));
      return;
    }
    if (i > 0) {
      chars[i - 1] = ' ';
      onChange?.(chars.join('').trimEnd().replace(/ /g, ''));
      focusAt(i - 1);
    }
  };

  const handleInput = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.replace(/\D/g, '');
    // Mobile keyboards often clear via onChange("") instead of Backspace.
    if (!typed) {
      clearAt(i);
      return;
    }

    if (typed.length > 1) {
      const merged = (value.slice(0, i) + typed).slice(0, length);
      const clean = commit(merged);
      focusAt(clean.length);
      return;
    }

    const chars = value.padEnd(length, ' ').split('');
    chars[i] = typed;
    commit(chars.join('').replace(/ /g, ''));
    focusAt(i + 1);
  };

  const handleKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      clearAt(i);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(i - 1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clean = commit(e.clipboardData.getData('text'));
    focusAt(clean.length);
  };

  return (
    <div
      className={cn('flex gap-2.5', className)}
      role="group"
      aria-label={`${length}-digit code`}
      aria-describedby={describedBy}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d.trim()}
          onChange={handleInput(i)}
          onKeyDown={handleKeyDown(i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={error ? true : undefined}
          className={cn(
            'font-mono bg-surface h-[66px] min-w-0 flex-1 rounded-panel border text-center text-[27px] leading-none font-bold text-ink caret-brand',
            'focus:outline-none focus-visible:ring-4',
            error
              ? 'border-danger bg-danger/8 focus-visible:border-danger focus-visible:ring-danger/20'
              : 'border-border focus-visible:border-brand focus-visible:ring-brand/16',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        />
      ))}
    </div>
  );
}

export function OtpDebugBanner({
  code,
  className,
}: {
  code?: string | null | undefined;
  className?: string | undefined;
}) {
  if (!import.meta.env.DEV || !code) return null;
  return (
    <div
      className={cn(
        'border-border bg-page-deep flex items-center gap-2.5 rounded-xl border border-dashed px-3.5 py-3',
        className
      )}
    >
      <span className="font-mono text-4xs font-bold tracking-eyebrow text-debug">DEBUG</span>
      <span className="text-muted flex-1 text-3xs">Use This OTP</span>
      <span className="font-mono text-body-lg font-bold tracking-[.22em] text-body">{code}</span>
    </div>
  );
}
