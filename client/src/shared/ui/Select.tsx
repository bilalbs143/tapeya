import type { ComponentProps, ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

import { cn } from '@/shared/lib/cn';
import { Field } from '@/shared/ui/Field';
import { CheckIcon, ChevronDownIcon } from '@/shared/ui/icons';

export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} />;
}

export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> & {
  error?: boolean | undefined;
};

/* Match Input field geometry (44px), not button sizing. */
export function SelectTrigger({ className, error = false, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      aria-invalid={error ? true : undefined}
      className={cn(
        'bg-surface flex h-11 w-full items-center gap-2 rounded-field border px-3 text-sm font-medium text-ink',
        'focus:outline-2 focus:outline-offset-0',
        error ? 'border-danger focus:outline-danger' : 'border-border focus:outline-brand',
        'data-[placeholder]:text-muted/80 disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      {...props}
    >
      <span className="flex-1 truncate text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="text-muted h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;

export function SelectContent({ className, children, position = 'popper', ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={6}
        className={cn(
          'bg-surface border-border z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-panel border p-1.5 text-ink shadow-card',
          'data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out origin-[var(--radix-select-content-transform-origin)]',
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="max-h-[280px]">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex h-9 cursor-default items-center rounded-chip pr-2.5 pl-8 text-sm font-semibold text-body outline-none select-none',
        'data-[highlighted]:bg-surface-raised data-[highlighted]:text-ink',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="text-brand absolute left-2.5">
        <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('text-dim font-mono px-2.5 pt-2 pb-1.5 text-3xs font-bold tracking-eyebrow uppercase', className)}
      {...props}
    />
  );
}

export type SelectFieldProps = Omit<ComponentProps<typeof SelectPrimitive.Root>, 'children'> & {
  label?: ReactNode;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  triggerClassName?: string | undefined;
  children?: ReactNode;
};

/** Same Field label/hint/error treatment as Input. */
export function SelectField({
  label,
  hint,
  error,
  required,
  placeholder = 'Select',
  children,
  className,
  triggerClassName,
  ...props
}: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <Select {...props}>
          <SelectTrigger id={id} aria-describedby={describedBy} error={invalid} className={triggerClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </Field>
  );
}
