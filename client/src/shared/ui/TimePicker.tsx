import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Field } from '@/shared/ui/Field';
import { ClockIcon } from '@/shared/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';

export type TimePickerProps = {
  id?: string | undefined;
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
  label?: string | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'] as const;

type Draft = { hour12: number; minute: number; period: 'AM' | 'PM' };

function parseValue(value: string | undefined): Draft {
  if (!value || typeof value !== 'string') return { hour12: 12, minute: 0, period: 'AM' };
  const parts = value.trim().split(':').map(Number);
  const h = parts[0];
  const m = parts[1];
  if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) {
    return { hour12: 12, minute: 0, period: 'AM' };
  }
  const hour24 = Math.max(0, Math.min(23, h));
  const minute = Math.max(0, Math.min(59, m));
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  return { hour12, minute, period };
}

function to24h(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function formatDisplay(value: string | undefined): string {
  if (!value) return '';
  const { hour12, minute, period } = parseValue(value);
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

/** Column time picker; value is 24h `HH:mm`. */
export function TimePicker({
  id,
  value = '',
  onChange,
  placeholder = 'Select time',
  label,
  hint,
  error,
  required = false,
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => parseValue(value));
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      for (const ref of [hourRef, minuteRef, periodRef]) {
        const el = ref.current?.querySelector('[data-selected="true"]');
        el?.scrollIntoView({ block: 'nearest' });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, draft.hour12, draft.minute, draft.period]);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(parseValue(value));
    setOpen(next);
  }

  function confirm() {
    const hour24 = to24h(draft.hour12, draft.period);
    onChange?.(`${String(hour24).padStart(2, '0')}:${String(draft.minute).padStart(2, '0')}`);
    setOpen(false);
  }

  const display = value ? formatDisplay(value) : '';
  const columnClass =
    'flex max-h-[180px] min-w-[52px] flex-col overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
  const itemClass =
    'flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-icon text-sm transition-colors hover:bg-surface-raised focus:bg-surface-raised focus:outline-none';

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      {({ id: fieldId, describedBy, invalid }) => (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              id={fieldId}
              disabled={disabled}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-describedby={describedBy}
              data-invalid={invalid || undefined}
              className={cn(
                'bg-surface flex h-11 w-full min-w-0 items-center gap-2 rounded-field border px-3 text-sm font-medium',
                'focus:outline-2 focus:outline-offset-0',
                error ? 'border-danger focus:outline-danger' : 'border-border focus:outline-brand',
                'disabled:pointer-events-none disabled:opacity-40',
                className
              )}
            >
              <span className={cn('min-w-0 flex-1 truncate text-left', display ? 'text-ink' : 'text-dim')}>
                {display || placeholder}
              </span>
              <ClockIcon size="sm" className="text-muted h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" onOpenAutoFocus={(event) => event.preventDefault()}>
            <div className="border-border flex border-b">
              <div ref={hourRef} className={columnClass}>
                {HOURS_12.map((h) => {
                  const selected = draft.hour12 === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-selected={selected ? 'true' : undefined}
                      className={cn(itemClass, selected ? 'bg-brand font-bold text-white' : 'text-ink')}
                      onClick={() => setDraft((prev) => ({ ...prev, hour12: h }))}
                    >
                      {h === 12 ? '12' : String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
              <div ref={minuteRef} className={cn(columnClass, 'border-border border-x')}>
                {MINUTES.map((m) => {
                  const n = Number(m);
                  const selected = draft.minute === n;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-selected={selected ? 'true' : undefined}
                      className={cn(itemClass, selected ? 'bg-brand font-bold text-white' : 'text-ink')}
                      onClick={() => setDraft((prev) => ({ ...prev, minute: n }))}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
              <div ref={periodRef} className={columnClass}>
                {PERIODS.map((p) => {
                  const selected = draft.period === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      data-selected={selected ? 'true' : undefined}
                      className={cn(itemClass, selected ? 'bg-brand font-bold text-white' : 'text-ink')}
                      onClick={() => setDraft((prev) => ({ ...prev, period: p }))}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={confirm}
                className="bg-brand hover:bg-brand-hover focus:outline-brand h-10 w-full rounded-field text-sm font-bold text-white focus:outline-2"
              >
                Done
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </Field>
  );
}
