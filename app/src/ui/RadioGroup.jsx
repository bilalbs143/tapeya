/**
 * Radix RadioGroup - radio button group
 */

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

const root = 'grid gap-2';
const item =
  'aspect-square h-4 w-4 rounded-full border border-slate-300 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const indicator = 'flex items-center justify-center';

export function RadioGroup({ className = '', ...props }) {
  return (
    <RadioGroupPrimitive.Root className={`${root} ${className}`} {...props} />
  );
}

export function RadioGroupItem({ className = '', ...props }) {
  return (
    <RadioGroupPrimitive.Item className={`${item} ${className}`} {...props}>
      <RadioGroupPrimitive.Indicator className={indicator}>
        <span className="h-2 w-2 rounded-full bg-indigo-600" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
