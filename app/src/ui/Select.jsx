/**
 * Radix Select - select dropdown
 */

import * as SelectPrimitive from '@radix-ui/react-select';

const trigger =
  'flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1';
const content =
  'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md';
const viewport = 'p-1';
const item =
  'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
const label = 'py-1.5 pl-2 pr-2 text-sm font-semibold';
const separator = '-mx-1 my-1 h-px bg-slate-200';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className = '', children, ...props }) {
  return (
    <SelectPrimitive.Trigger className={`${trigger} ${className}`} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className = '',
  position = 'popper',
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={`${content} ${className}`}
        {...props}
      >
        <SelectPrimitive.Viewport className={viewport}>
          {props.children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className = '', ...props }) {
  return (
    <SelectPrimitive.Item className={`${item} ${className}`} {...props}>
      <SelectPrimitive.ItemText />
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({ className = '', ...props }) {
  return (
    <SelectPrimitive.Label className={`${label} ${className}`} {...props} />
  );
}

export function SelectSeparator({ className = '', ...props }) {
  return (
    <SelectPrimitive.Separator
      className={`${separator} ${className}`}
      {...props}
    />
  );
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
