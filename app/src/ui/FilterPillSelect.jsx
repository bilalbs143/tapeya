/**
 * Compact pill trigger + Radix Select dropdown.
 * Pair with FilterPillSelectGroup for a unified filter bar (e.g. Type | Format).
 */

import * as SelectPrimitive from '@radix-ui/react-select';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  selectViewportInputClass,
} from '@/ui/Select';

// Intentionally heavier stroke than the Select.jsx chevron (2.5 vs 2) to suit the compact pill size.
function ChevronIcon({ className }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}

function PillSelectTrigger({ segment = 'single', label, displayValue, ariaLabel, disabled }) {
  return (
    <SelectPrimitive.Trigger
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      className={cn(
        // Base
        'group bg-surface relative flex min-h-[52px] w-full flex-col justify-center px-3.5 py-2.5 text-left text-white',
        'focus-visible:ring-brand/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        // Interactive states
        'hover:bg-white/[0.03]',
        'data-[state=open]:bg-white/[0.04] data-[state=open]:shadow-[inset_0_-2px_0_0_var(--color-brand)]',
        'data-[state=open]:[&_svg.chevron]:rotate-180',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-40',
        // Segment shape — border is managed by the outer group; individual segments only add the divider
        segment === 'left' && 'border-r border-[#141412]',
      )}
    >
      <span className="text-muted text-[10px] font-bold tracking-[0.08em] uppercase">{label}</span>

      <span className="mt-1 flex items-center justify-between gap-2 pr-1">
        <span className="truncate text-[13px] font-semibold text-white">{displayValue}</span>
        <span
          className={cn(
            'text-brand flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/5',
            'group-data-[state=open]:bg-brand/15 transition-colors',
          )}
        >
          <SelectPrimitive.Icon asChild>
            <ChevronIcon className="chevron transition-transform duration-200" />
          </SelectPrimitive.Icon>
        </span>
      </span>
    </SelectPrimitive.Trigger>
  );
}

/**
 * Wraps two or more FilterPillSelect components in a unified pill bar.
 * Children are laid out in equal-width columns — no need to specify count.
 *
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export function FilterPillSelectGroup({ children, className }) {
  return (
    <div
      className={cn(
        'bg-surface overflow-hidden rounded-[12px] border-2 border-[#141412] shadow-[0_8px_24px_rgba(0,0,0,0.25)]',
        className,
      )}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]">{children}</div>
    </div>
  );
}

/**
 * @param {{
 *   label: string,
 *   value?: string,
 *   defaultValue?: string,
 *   onValueChange?: (value: string) => void,
 *   options: { value: string, label: string }[],
 *   ariaLabel?: string,
 *   segment?: 'left' | 'right' | 'single',
 *   disabled?: boolean,
 * }} props
 */
export function FilterPillSelect({
  label,
  value,
  defaultValue,
  onValueChange,
  options,
  ariaLabel,
  segment = 'single',
  disabled = false,
}) {
  const displayValue = options.find((opt) => opt.value === value)?.label ?? value ?? defaultValue ?? '—';

  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
      <PillSelectTrigger segment={segment} label={label} displayValue={displayValue} ariaLabel={ariaLabel} disabled={disabled} />
      <SelectContent
        className={cn(selectContentInputClass, 'rounded-xl border-[#141412] shadow-[0_12px_32px_rgba(0,0,0,0.45)]')}
        viewportClassName={cn(selectViewportInputClass, 'p-1.5')}
        position="popper"
        sideOffset={6}
      >
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className={selectItemInputClass}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
