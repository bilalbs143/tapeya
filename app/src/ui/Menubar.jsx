/**
 * Radix Menubar - horizontal menu bar
 */

import * as MenubarPrimitive from '@radix-ui/react-menubar';

const root = 'flex h-10 items-center space-x-1 rounded-md border bg-white p-1';
const menu =
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md';
const trigger =
  'flex cursor-pointer select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none hover:bg-slate-100 focus:bg-slate-100 data-[state=open]:bg-slate-100';
const item =
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
const separator = '-mx-1 my-1 h-px bg-slate-200';
const subTrigger =
  'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 data-[state=open]:bg-slate-100';
const subContent =
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md';

export const Menubar = MenubarPrimitive.Root;
export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarTrigger = MenubarPrimitive.Trigger;
export const MenubarPortal = MenubarPrimitive.Portal;
export const MenubarContent = MenubarPrimitive.Content;
export const MenubarItem = MenubarPrimitive.Item;
export const MenubarSeparator = MenubarPrimitive.Separator;
export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarSubTrigger = MenubarPrimitive.SubTrigger;
export const MenubarSubContent = MenubarPrimitive.SubContent;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
export const MenubarCheckboxItem = MenubarPrimitive.CheckboxItem;
export const MenubarRadioItem = MenubarPrimitive.RadioItem;

export function MenubarRoot({ className = '', ...props }) {
  return (
    <MenubarPrimitive.Root className={`${root} ${className}`} {...props} />
  );
}

export function MenubarContentStyled({ className = '', ...props }) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content className={`${menu} ${className}`} {...props} />
    </MenubarPrimitive.Portal>
  );
}
