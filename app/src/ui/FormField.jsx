/**
 * Form field wrapper: label + control (e.g. Input).
 * Use with react-hook-form: pass label and htmlFor; render Input with {...register(name)} and error from formState.errors.
 */

import { Label } from '@/ui/Label';

const defaultLabelClass = 'mb-4 block text-[16px] text-white';
/** Checkout / billing: 14px, #A2A6AB */
export const formFieldLabelCheckoutClass =
  'mb-4 block text-[14px] !font-bold text-[#A2A6AB]';
/** Edit modal: 12px, #A2A6AB */
export const formFieldLabelEditClass =
  'mb-2 block text-[12px] !font-bold text-[#A2A6AB]';

function getLabelClass(variant, labelClassName) {
  if (labelClassName) return labelClassName;
  if (variant === 'edit') return formFieldLabelEditClass;
  if (variant === 'checkout') return formFieldLabelCheckoutClass;
  return defaultLabelClass;
}

export function FormField({
  htmlFor,
  label,
  children,
  className = '',
  labelClassName = '',
  variant,
  required,
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label
          htmlFor={htmlFor}
          className={getLabelClass(variant, labelClassName)}
        >
          {label}
          {required && <span className="text-red-300"> *</span>}
        </Label>
      )}
      {children}
    </div>
  );
}
