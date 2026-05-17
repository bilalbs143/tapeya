/**
 * Radix ContextMenu - right-click context menu
 */

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

const content = 'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md';
const item =
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
const separator = '-mx-1 my-1 h-px bg-slate-200';
const _subTrigger =
  'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 data-[state=open]:bg-slate-100';
const _subContent = 'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md';

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuPortal = ContextMenuPrimitive.Portal;
export const ContextMenuItem = ContextMenuPrimitive.Item;
export const ContextMenuCheckboxItem = ContextMenuPrimitive.CheckboxItem;
export const ContextMenuRadioItem = ContextMenuPrimitive.RadioItem;
export const ContextMenuLabel = ContextMenuPrimitive.Label;
export const ContextMenuSeparator = ContextMenuPrimitive.Separator;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuSub = ContextMenuPrimitive.Sub;
export const ContextMenuSubTrigger = ContextMenuPrimitive.SubTrigger;
export const ContextMenuSubContent = ContextMenuPrimitive.SubContent;

export function ContextMenuContent({ className = '', children, ...props }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content className={`${content} ${className}`} {...props}>
        {children}
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuItemStyled({ className = '', ...props }) {
  return <ContextMenuPrimitive.Item className={`${item} ${className}`} {...props} />;
}

export function ContextMenuSeparatorStyled({ className = '', ...props }) {
  return <ContextMenuPrimitive.Separator className={`${separator} ${className}`} {...props} />;
}
