/**
 * Form field wrapper: label + control (e.g. Input).
 * Use with react-hook-form: pass label and htmlFor; render Input with {...register(name)} and error from formState.errors.
 */

import { FORM_FIELD_LABEL_CLASS, FORM_FIELD_REQUIRED_CLASS, FORM_FIELD_WRAPPER_CLASS } from '@/lib/constants/formLayout';
import { Label } from '@/ui/Label';

function getLabelClass(labelClassName) {
  return labelClassName || FORM_FIELD_LABEL_CLASS;
}

export function FormField({ htmlFor, label, children, className = '', labelClassName = '', required }) {
  return (
    <div className={`${FORM_FIELD_WRAPPER_CLASS} ${className}`.trim()}>
      {label && (
        <Label htmlFor={htmlFor} className={getLabelClass(labelClassName)}>
          {label}
          {required && <span className={FORM_FIELD_REQUIRED_CLASS}> *</span>}
        </Label>
      )}
      {children}
    </div>
  );
}
