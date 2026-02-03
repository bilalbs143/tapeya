import React from 'react';
import { Controller } from 'react-hook-form';

import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';

export const ControlledInput = ({
  control,
  name,
  label,
  rules,
  defaultValue = '',
  type,
  showPasswordToggle,
  EyeIcon,
  EyeSlashIcon,
  ...props
}) => {
  return (
    <>
      {label && (
        <Label className="font-titles-14 text-sm text-[var(--text-color)]">
          {label}
        </Label>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            {...props}
            type={type}
            showPasswordToggle={showPasswordToggle}
            EyeIcon={EyeIcon}
            EyeSlashIcon={EyeSlashIcon}
            error={fieldState.error?.message}
            value={field.value ?? ''}
            onChange={(e) => {
              field.onChange(e);
              props.onChange?.(e);
            }}
            onBlur={(e) => {
              field.onBlur();
              props.onBlur?.(e);
            }}
          />
        )}
      />
    </>
  );
};
