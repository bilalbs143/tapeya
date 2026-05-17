/**
 * ToggleGroupField
 *
 * Form field wrapper for ToggleGroup: FormField + Controller + ToggleGroup + error.
 * Use with react-hook-form. Coding guidelines: docs/Coding guidelines.md
 *
 * @param {{ name: string, control: import('react-hook-form').Control, label: string, options: { value: string, label: string }[], error?: string, required?: boolean }} props
 */

import { Controller } from 'react-hook-form';

import { FormField } from '@/ui/FormField';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

export function ToggleGroupField({ name, control, label, options, error, required }) {
  return (
    <FormField label={label} htmlFor={name} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <ToggleGroup
              type="single"
              value={field.value}
              onValueChange={(v) => v != null && field.onChange(v)}
              className="flex flex-wrap gap-2"
              aria-invalid={error ? 'true' : undefined}
            >
              {options.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {error && (
              <p className="text-sm text-red-200" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      />
    </FormField>
  );
}
