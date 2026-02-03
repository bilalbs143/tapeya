'use client';

import React, { forwardRef, useCallback, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/cn';

const Input = forwardRef((props, ref) => {
  const {
    className,
    type = 'text',
    name,
    id,
    value,
    onChange,
    onBlur,
    onClick,
    placeholder,
    max,
    min,
    maxLength,
    minLength,
    error,
    Icon,
    showPasswordToggle = false,
    eyeIconColor,
    ...rest
  } = props;

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const { t } = useTranslations();

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible((prev) => !prev);
  }, []);

  const isPasswordType = type === 'password' || showPasswordToggle;
  const inputType = isPasswordType && isPasswordVisible ? 'text' : type;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="relative w-full">
        <input
          ref={ref}
          id={id || name}
          name={name}
          type={inputType}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          onClick={onClick}
          placeholder={placeholder || t('enter_text')}
          max={max}
          min={min}
          maxLength={maxLength}
          minLength={minLength}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-3 text-sm placeholder-gray-500 placeholder:text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none md:placeholder:text-sm',
            isPasswordType ? 'pr-14' : '',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : '',
            className,
          )}
          {...rest}
        />

        {/* Password Toggle Icon */}
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors duration-200 hover:bg-white/10"
            style={eyeIconColor ? { color: eyeIconColor } : {}}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Regular Icon (non-password) */}
        {Icon && !isPasswordType && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {Icon}
          </div>
        )}
      </div>
      {/* Error message container (no extra height when there's no error) */}
      <div className={error ? 'flex h-5 items-center' : 'h-0'}>
        {error && (
          <p className="text-xs text-red-500" role="alert">
            {t(error)}
          </p>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
