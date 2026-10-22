import { type ComponentProps, useState } from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/shared/lib/cn';
import { Field } from '@/shared/ui/Field';
import { CalendarIcon } from '@/shared/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';

export type DatePickerDays = 'past' | 'future' | 'any';

export type DatePickerProps = {
  id?: string | undefined;
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
  label?: string | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Default `past` (DOB); `future` or `any` for fixtures/open ranges. */
  days?: DatePickerDays | undefined;
  /** @deprecated Prefer `days="future"`. */
  allowFuture?: boolean | undefined;
  className?: string | undefined;
};

function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return undefined;
  const parts = value.trim().split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year == null || month == null || day == null) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toIsoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplay(value: string | undefined): string {
  const date = parseIsoDate(value);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** ISO `YYYY-MM-DD` calendar field. */
export function DatePicker({
  id,
  value = '',
  onChange,
  placeholder = 'Select Date',
  label,
  hint,
  error,
  required = false,
  disabled = false,
  days: daysProp,
  allowFuture = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const days = daysProp ?? (allowFuture ? 'future' : 'past');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledDays = days === 'any' ? undefined : days === 'future' ? { before: today } : { after: today };
  const startMonth = new Date(today.getFullYear() - 100, 0);
  const endMonth = days === 'past' ? today : new Date(today.getFullYear() + (days === 'any' ? 10 : 2), 11);
  const display = value ? formatDisplay(value) : '';

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange?.(toIsoDate(date));
    setOpen(false);
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      {({ id: fieldId, describedBy, invalid }) => (
        <Popover open={open} onOpenChange={setOpen}>
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
              <CalendarIcon size="sm" className="text-muted h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" onOpenAutoFocus={(event) => event.preventDefault()}>
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              disabled={disabledDays}
              defaultMonth={selected ?? today}
              captionLayout="dropdown"
              startMonth={startMonth}
              endMonth={endMonth}
              className="rdp-tapeya"
              classNames={dayPickerClassNames}
            />
          </PopoverContent>
        </Popover>
      )}
    </Field>
  );
}

const rdp = getDefaultClassNames();

const dayPickerClassNames: NonNullable<ComponentProps<typeof DayPicker>['classNames']> = {
  root: cn(rdp.root, 'text-ink'),
  months: cn(rdp.months, 'relative flex flex-col gap-3'),
  month: cn(rdp.month, 'flex flex-col gap-3'),
  month_caption: cn(rdp.month_caption, 'flex items-center justify-center gap-2 px-9'),
  // rdp puts an invisible <select> on caption_label — do not sr-only it.
  caption_label: cn(rdp.caption_label, 'inline-flex items-center gap-1 text-xs font-semibold text-ink'),
  dropdowns: cn(rdp.dropdowns, 'flex items-center gap-2'),
  dropdown_root: cn(
    rdp.dropdown_root,
    'bg-surface-raised border-border relative inline-flex min-w-0 cursor-pointer items-center rounded-field border px-2.5 py-1.5'
  ),
  dropdown: rdp.dropdown,
  // Nav overlays caption — chevrons re-enable pointer events.
  nav: cn(rdp.nav, 'pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between'),
  button_previous: cn(
    rdp.button_previous,
    'pointer-events-auto text-muted hover:bg-surface-raised hover:text-ink grid h-8 w-8 place-items-center rounded-icon'
  ),
  button_next: cn(
    rdp.button_next,
    'pointer-events-auto text-muted hover:bg-surface-raised hover:text-ink grid h-8 w-8 place-items-center rounded-icon'
  ),
  chevron: cn(rdp.chevron, 'fill-current'),
  weekdays: cn(rdp.weekdays, 'flex'),
  weekday: cn(rdp.weekday, 'text-dim w-9 text-center font-mono text-4xs font-bold tracking-eyebrow uppercase'),
  week: cn(rdp.week, 'mt-1 flex'),
  day: cn(rdp.day, 'relative h-9 w-9 p-0 text-center text-sm'),
  day_button: cn(
    rdp.day_button,
    'focus:outline-brand grid h-9 w-9 place-items-center rounded-icon text-ink focus:outline-2 disabled:pointer-events-none disabled:opacity-30'
  ),
  today: cn(rdp.today, 'font-extrabold text-brand-text'),
  outside: cn(rdp.outside, 'text-dim'),
  disabled: cn(rdp.disabled, 'opacity-30'),
  hidden: cn(rdp.hidden, 'invisible'),
};
