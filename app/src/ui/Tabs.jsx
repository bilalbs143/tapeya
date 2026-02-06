/**
 * Radix Tabs - tabbed interface
 */

import * as TabsPrimitive from '@radix-ui/react-tabs';

const list =
  'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500';
const trigger =
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm';
const content =
  'mt-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';

/** Profile tabs: dark theme, full-width, icon + label, active = gold bg + black text */
export const profileListClass =
  'flex w-full gap-1 p-1 text-white';
export const profileTriggerClass =
  'group inline-flex flex-1 items-center justify-center gap-1 rounded-[17px] px-2 py-2 text-[13px] font-bold uppercase transition-colors data-[state=inactive]:bg-transparent data-[state=inactive]:text-white data-[state=active]:bg-[#DA9811] data-[state=active]:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a11e] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
export const profileTabIconClass =
  'shrink-0 transition-[filter] duration-150 group-data-[state=active]:brightness-0';
export const profileTabIconSize = 18;

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;

export function TabsListStyled({ className = '', ...props }) {
  return <TabsPrimitive.List className={`${list} ${className}`} {...props} />;
}

export function TabsTriggerStyled({ className = '', ...props }) {
  return (
    <TabsPrimitive.Trigger className={`${trigger} ${className}`} {...props} />
  );
}

export function TabsContentStyled({ className = '', ...props }) {
  return (
    <TabsPrimitive.Content className={`${content} ${className}`} {...props} />
  );
}
