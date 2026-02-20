/**
 * Date picker with calendar popover. Matches Input styling (pill shape, dark theme).
 */

import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';

import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';

const inputBase =
  'flex h-12 w-full items-center rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50 transition-colors cursor-pointer text-left';

function formatDisplay(value) {
  if (!value || typeof value !== 'string') return '';
  const d = parseValue(value);
  if (!d) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function parseValue(value) {
  if (!value || typeof value !== 'string') return undefined;
  const [month, day, year] = value.split(/[-/]/).map(Number);
  if (!month || !day || !year) return undefined;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? undefined : d;
}

export function DatePicker({
  id,
  value = '',
  onChange,
  placeholder = 'MM-DD-YYYY',
  className = '',
  disabled,
  allowFuture = false,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => parseValue(value));

  useEffect(() => {
    setSelectedDate(parseValue(value));
  }, [value]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayPickerDisabled = allowFuture ? { before: today } : { after: new Date() };
  const endMonth = allowFuture
    ? new Date(today.getFullYear() + 2, 11)
    : new Date();

  const handleSelect = (date) => {
    setSelectedDate(date);
    if (date) {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      onChange?.(`${mm}-${dd}-${yyyy}`);
      setOpen(false);
    }
  };

  const displayValue = value ? formatDisplay(value) : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={`${inputBase} ${className}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={placeholder}
          {...props}
        >
          <span className={displayValue ? 'text-white' : 'text-[#A2A6AB78]'}>
            {displayValue || placeholder}
          </span>
          <CalendarIcon className="ml-auto shrink-0 text-white/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto !rounded-xl !border-[#141412] !bg-[#141412] p-0 shadow-lg"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={dayPickerDisabled}
          defaultMonth={selectedDate || new Date()}
          captionLayout="dropdown"
          reverseYears
          startMonth={new Date(new Date().getFullYear() - 100, 0)}
          endMonth={endMonth}
          classNames={{
            root: '',
            months: 'space-y-3',
            month: 'space-y-3',
            month_caption: 'flex items-center justify-center gap-3 flex-wrap',
            caption_label: 'sr-only',
            dropdowns: 'flex gap-2 items-center',
            dropdown_root:
              'inline-flex min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            dropdown:
              'rounded-lg border-0 bg-[#1f1f1d] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50 appearance-none cursor-pointer min-w-[5rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            chevron: '!fill-white !text-white shrink-0 [&_polygon]:!fill-white',
            nav: 'flex gap-1 shrink-0',
            button_previous:
              'h-8 w-8 rounded flex items-center justify-center !text-white hover:bg-white/10',
            button_next:
              'h-8 w-8 rounded flex items-center justify-center !text-white hover:bg-white/10',
            weekdays: 'flex',
            weekday: 'w-9 text-center text-sm text-[#A2A6AB78]',
            week: 'flex',
            day: 'h-9 w-9 text-center text-sm',
            day_button:
              'h-9 w-9 rounded text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50',
            selected: '!bg-[#FF9700] !text-white hover:!bg-[#FF9700]/90',
            today: 'font-semibold text-[#FFB703]',
            outside: 'text-white/40',
            disabled: 'text-white/30 cursor-not-allowed',
            hidden: 'invisible',
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function CalendarIcon({ className = '' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
