/**
 * Radix DropdownMenu - dropdown menu
 */

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

const content = 'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md';
const item =
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
const separator = '-mx-1 my-1 h-px bg-slate-200';
const subTrigger =
  'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 data-[state=open]:bg-slate-100';
const subContent = 'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md';
const shortcut = 'ml-auto text-xs text-slate-500';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({ className = '', sideOffset = 4, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content sideOffset={sideOffset} className={`${content} ${className}`} {...props} />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className = '', ...props }) {
  return <DropdownMenuPrimitive.Item className={`${item} ${className}`} {...props} />;
}

export function DropdownMenuCheckboxItem({ className = '', ...props }) {
  return <DropdownMenuPrimitive.CheckboxItem className={`${item} ${className}`} {...props} />;
}

export function DropdownMenuRadioItem({ className = '', ...props }) {
  return <DropdownMenuPrimitive.RadioItem className={`${item} ${className}`} {...props} />;
}

export function DropdownMenuLabel({ className = '', ...props }) {
  return <DropdownMenuPrimitive.Label className={`px-2 py-1.5 text-sm font-semibold ${className}`} {...props} />;
}

export function DropdownMenuSeparator({ className = '', ...props }) {
  return <DropdownMenuPrimitive.Separator className={`${separator} ${className}`} {...props} />;
}

export function DropdownMenuShortcut({ className = '', ...props }) {
  return <span className={`${shortcut} ${className}`} {...props} />;
}

export function DropdownMenuSubTrigger({ className = '', ...props }) {
  return <DropdownMenuPrimitive.SubTrigger className={`${subTrigger} ${className}`} {...props} />;
}

export function DropdownMenuSubContent({ className = '', ...props }) {
  return <DropdownMenuPrimitive.SubContent className={`${subContent} ${className}`} {...props} />;
}
