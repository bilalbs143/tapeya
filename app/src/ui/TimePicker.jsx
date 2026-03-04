/**
 * Time picker with popover (hours, minutes, AM/PM columns).
 * Matches DatePicker trigger styling. Value format: 24h "HH:mm" (e.g. "14:30").
 */

import { useEffect, useRef, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';

const inputBase =
  'flex h-12 w-full items-center rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50 transition-colors cursor-pointer text-left';

/** 12h display order: 12, 1, 2, ..., 11 */
const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function parseValue(value) {
  if (!value || typeof value !== 'string') return { hour12: 12, minute: 0, period: 'AM' };
  const [h, m] = value.trim().split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return { hour12: 12, minute: 0, period: 'AM' };
  const hour24 = Math.max(0, Math.min(23, h));
  const minute = Math.max(0, Math.min(59, m));
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  return { hour12, minute, period };
}

function to24h(hour12, period) {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function formatDisplay(value) {
  if (!value || typeof value !== 'string') return '';
  const { hour12, minute, period } = parseValue(value);
  const h = String(hour12);
  const m = String(minute).padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export function TimePicker({
  id,
  value = '',
  onChange,
  placeholder = 'Select time',
  className = '',
  disabled,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const periodRef = useRef(null);

  useEffect(() => {
    const p = parseValue(value);
    setHour12(p.hour12);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  const scrollToSelected = (ref) => {
    if (!ref?.current) return;
    const el = ref.current.querySelector('[data-selected="true"]');
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollToSelected(hourRef);
        scrollToSelected(minuteRef);
        scrollToSelected(periodRef);
      }, 0);
    }
  }, [open, hour12, minute, period]);

  const handleConfirm = () => {
    const hour24 = to24h(hour12, period);
    const h24 = String(hour24).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    onChange?.(`${h24}:${m}`);
    setOpen(false);
  };

  const displayValue = value ? formatDisplay(value) : '';

  const columnClass = 'flex flex-col overflow-y-auto max-h-[180px] min-w-[52px] py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
  const itemClass =
    'flex h-9 shrink-0 cursor-pointer items-center justify-center rounded text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none';
  const selectedClass = '!bg-[#DA9811] !text-white font-medium';

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
          <ClockIcon className="ml-auto shrink-0 text-white/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto !rounded-xl !border-[#141412] !bg-[#141412] p-0 shadow-lg"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex border-b border-[#1f1f1d]">
          <div ref={hourRef} className={columnClass}>
            {HOURS_12.map((h) => {
              const isSelected = hour12 === h;
              return (
                <button
                  key={h}
                  type="button"
                  data-selected={isSelected ? 'true' : undefined}
                  className={`${itemClass} ${isSelected ? selectedClass : 'text-white'}`}
                  onClick={() => setHour12(h)}
                >
                  {h === 12 ? '12' : String(h).padStart(2, '0')}
                </button>
              );
            })}
          </div>
          <div ref={minuteRef} className={`${columnClass} border-x border-[#1f1f1d]`}>
            {MINUTES.map((m) => {
              const n = parseInt(m, 10);
              const isSelected = minute === n;
              return (
                <button
                  key={m}
                  type="button"
                  data-selected={isSelected ? 'true' : undefined}
                  className={`${itemClass} ${isSelected ? selectedClass : 'text-white'}`}
                  onClick={() => setMinute(n)}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <div ref={periodRef} className={columnClass}>
            {PERIODS.map((p) => {
              const isSelected = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  data-selected={isSelected ? 'true' : undefined}
                  className={`${itemClass} ${isSelected ? selectedClass : 'text-white'}`}
                  onClick={() => setPeriod(p)}
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
            onClick={handleConfirm}
            className="w-full rounded-lg bg-[#DA9811] py-2 text-sm font-bold text-[#080807] transition-colors hover:bg-[#DA9811]/90 focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ClockIcon({ className = '' }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
