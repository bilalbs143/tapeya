/**
 * Radix NavigationMenu - horizontal navigation with dropdown
 */

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';

const root = 'relative z-10 flex max-w-max flex-1 items-center justify-center';
const list = 'flex flex-1 list-none items-center justify-center space-x-1';
const item = 'relative';
const trigger =
  'group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50';
const content = 'absolute left-0 top-full w-full md:w-auto';
const link =
  'block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none hover:bg-slate-100 focus:bg-slate-100';

export const NavigationMenu = NavigationMenuPrimitive.Root;
export const NavigationMenuList = NavigationMenuPrimitive.List;
export const NavigationMenuItem = NavigationMenuPrimitive.Item;
export const NavigationMenuTrigger = NavigationMenuPrimitive.Trigger;
export const NavigationMenuContent = NavigationMenuPrimitive.Content;
export const NavigationMenuLink = NavigationMenuPrimitive.Link;
export const NavigationMenuViewport = NavigationMenuPrimitive.Viewport;

export function NavigationMenuRoot({ className = '', ...props }) {
  return (
    <NavigationMenuPrimitive.Root
      className={`${root} ${className}`}
      {...props}
    />
  );
}

export function NavigationMenuListStyled({ className = '', ...props }) {
  return (
    <NavigationMenuPrimitive.List
      className={`${list} ${className}`}
      {...props}
    />
  );
}

export function NavigationMenuItemStyled({ className = '', ...props }) {
  return (
    <NavigationMenuPrimitive.Item
      className={`${item} ${className}`}
      {...props}
    />
  );
}

export function NavigationMenuTriggerStyled({ className = '', ...props }) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={`${trigger} ${className}`}
      {...props}
    />
  );
}

export function NavigationMenuContentStyled({ className = '', ...props }) {
  return (
    <NavigationMenuPrimitive.Content
      className={`${content} ${className}`}
      {...props}
    />
  );
}

export function NavigationMenuLinkStyled({ className = '', ...props }) {
  return (
    <NavigationMenuPrimitive.Link
      className={`${link} ${className}`}
      {...props}
    />
  );
}
