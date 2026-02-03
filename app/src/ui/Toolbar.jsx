/**
 * Radix Toolbar - formatting toolbar
 */

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

const root = 'relative flex select-none items-center gap-1';
const toggleGroup = 'flex items-center';
const toggleItem =
  'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-slate-200';
const separator = 'mx-1 w-px bg-slate-200';

export const Toolbar = ToolbarPrimitive.Root;
export const ToolbarToggleGroup = ToolbarPrimitive.ToggleGroup;
export const ToolbarToggleItem = ToolbarPrimitive.ToggleItem;
export const ToolbarSeparator = ToolbarPrimitive.Separator;
export const ToolbarLink = ToolbarPrimitive.Link;
export const ToolbarButton = ToolbarPrimitive.Button;

export function ToolbarRoot({ className = '', ...props }) {
  return (
    <ToolbarPrimitive.Root className={`${root} ${className}`} {...props} />
  );
}

export function ToolbarToggleGroupStyled({ className = '', ...props }) {
  return (
    <ToolbarPrimitive.ToggleGroup
      className={`${toggleGroup} ${className}`}
      {...props}
    />
  );
}

export function ToolbarToggleItemStyled({ className = '', ...props }) {
  return (
    <ToolbarPrimitive.ToggleItem
      className={`${toggleItem} ${className}`}
      {...props}
    />
  );
}

export function ToolbarSeparatorStyled({ className = '', ...props }) {
  return (
    <ToolbarPrimitive.Separator
      className={`${separator} ${className}`}
      {...props}
    />
  );
}
