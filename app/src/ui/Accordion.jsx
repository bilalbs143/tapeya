/**
 * Radix Accordion - collapsible content sections
 * Variants: single (one open) | multiple (many open)
 */

import * as AccordionPrimitive from '@radix-ui/react-accordion';

const baseItem = 'border-b';
const baseTrigger =
  'flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180';
const baseContent = 'overflow-hidden text-sm';
const baseChevron = 'h-4 w-4 shrink-0 transition-transform duration-200';

export function Accordion({
  type = 'single',
  collapsible,
  className = '',
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Root
      type={type}
      collapsible={collapsible}
      className={className}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

export function AccordionItem({ value, className = '', children, ...props }) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className={`${baseItem} ${className}`}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  );
}

export function AccordionTrigger({ className = '', children, ...props }) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={`${baseTrigger} ${className}`}
        {...props}
      >
        {children}
        <ChevronIcon />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className = '', children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className={`${baseContent} ${className}`}
      {...props}
    >
      <div className="pt-0 pb-4">{children}</div>
    </AccordionPrimitive.Content>
  );
}

function ChevronIcon() {
  return (
    <svg
      className={baseChevron}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
