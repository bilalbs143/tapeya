/**
 * Form field wrapper: label + control (e.g. Input).
 * Use with react-hook-form: pass label and htmlFor; render Input with {...register(name)} and error from formState.errors.
 */

import { Label } from '@/ui/Label';

export function FormField({
  htmlFor,
  label,
  children,
  className = '',
  required,
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={htmlFor} className="mb-4 text-[16px] block text-white">
          {label}
          {required && <span className="text-red-300"> *</span>}
        </Label>
      )}
      {children}
    </div>
  );
}
