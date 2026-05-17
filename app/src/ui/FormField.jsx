/**
 * Form field wrapper: label + control (e.g. Input).
 * Use with react-hook-form: pass label and htmlFor; render Input with {...register(name)} and error from formState.errors.
 */

import { Label } from '@/ui/Label';

/** Single label style used across the entire app. */
const labelClass = 'mb-2 block text-[14px] text-[#A2A6AB]';

/** Named exports for pages that import the class directly. */
// eslint-disable-next-line react-refresh/only-export-components
export const formFieldLabelCheckoutClass = labelClass;
// eslint-disable-next-line react-refresh/only-export-components
export const formFieldLabelEditClass = labelClass;

function getLabelClass(labelClassName) {
  return labelClassName || labelClass;
}

export function FormField({ htmlFor, label, children, className = '', labelClassName = '', required }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <Label htmlFor={htmlFor} className={getLabelClass(labelClassName)}>
          {label}
          {required && <span className="text-red-300"> *</span>}
        </Label>
      )}
      {children}
    </div>
  );
}
