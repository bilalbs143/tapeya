import { type ComponentProps, createContext, useContext } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/shared/lib/cn';

export type TabsVariant = 'underline' | 'segmented' | 'scroll' | 'pill' | 'chip';

const TabsVariantCtx = createContext<TabsVariant>('underline');

export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />;
}

export type TabsListProps = ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant | undefined;
};

export function TabsList({ className, variant = 'underline', ...props }: TabsListProps) {
  return (
    <TabsVariantCtx.Provider value={variant}>
      <TabsPrimitive.List
        className={cn(
          variant === 'segmented' &&
            'border-border bg-surface inline-flex w-fit items-center gap-0.5 rounded-field border p-0.5',
          variant === 'underline' && 'border-border-subtle flex items-center border-b',
          variant === 'scroll' && 'border-border-subtle no-scrollbar flex items-center gap-0 overflow-x-auto border-b',
          variant === 'pill' &&
            'bg-page-deep border-border-subtle inline-flex items-center gap-1 rounded-full border p-1',
          /* py-0.5: overflow-x-auto enables overflow-y and would clip borders without it */
          variant === 'chip' && 'no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5',
          className
        )}
        {...props}
      />
    </TabsVariantCtx.Provider>
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = useContext(TabsVariantCtx);

  return (
    <TabsPrimitive.Trigger
      className={cn(
        'focus-visible:outline-brand shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1',
        variant === 'segmented' &&
          'text-muted data-[state=active]:bg-brand rounded-nest px-3.5 py-1.5 text-2xs font-bold data-[state=active]:text-white',
        variant === 'underline' &&
          'text-muted data-[state=active]:border-brand data-[state=active]:text-ink border-b-2 border-transparent px-4 py-2.5 text-xs leading-normal font-medium data-[state=active]:font-semibold',
        variant === 'scroll' &&
          'text-muted data-[state=active]:border-brand data-[state=active]:text-ink border-b-2 border-transparent px-3.5 py-2.5 text-xs leading-normal font-medium whitespace-nowrap data-[state=active]:font-semibold',
        variant === 'pill' &&
          'text-muted hover:text-ink data-[state=active]:bg-brand rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:text-white',
        variant === 'chip' &&
          'border-border-subtle bg-surface text-muted data-[state=active]:bg-brand flex min-h-8 items-center rounded-icon border px-2.5 text-3xs font-bold whitespace-nowrap data-[state=active]:border-transparent data-[state=active]:text-white',
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-4 outline-none focus-visible:outline-none', className)} {...props} />;
}
