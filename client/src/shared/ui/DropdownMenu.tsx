import type { ComponentProps } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

import { cn } from '@/shared/lib/cn';

/** Radix dropdown — keyboard/focus/Escape vs hand-rolled overflow menus. */
export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group {...props} />;
}

export function DropdownMenuPortal(props: ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

export type DropdownMenuContentProps = ComponentProps<typeof DropdownMenuPrimitive.Content>;

export function DropdownMenuContent({ className, sideOffset = 6, align = 'end', ...props }: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'bg-surface border-border z-50 min-w-[160px] overflow-hidden rounded-field border py-1 text-ink shadow-pop',
          'data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out origin-[var(--radix-dropdown-menu-content-transform-origin)]',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export type DropdownMenuItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  destructive?: boolean | undefined;
};

export function DropdownMenuItem({ className, destructive = false, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex w-full cursor-default items-center px-3.5 py-2 text-left text-2xs font-semibold outline-none select-none',
        'data-[highlighted]:bg-surface-raised',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        destructive ? 'text-danger-text' : 'text-ink data-[highlighted]:text-ink',
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('border-border-subtle my-1 border-t', className)} {...props} />;
}
