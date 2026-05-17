/**
 * Reusable form input with error state and optional password visibility toggle.
 * Use with react-hook-form via register() or Controller; supports forwardRef.
 */

import { forwardRef, useCallback, useState } from 'react';

const inputBase =
  'h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 transition-colors';

const inputVariants = {
  default: 'focus:ring-[#FF9700]/50',
  error: 'focus:ring-red-500/50',
};

export const Input = forwardRef(function Input(
  { className = '', type = 'text', error, showPasswordToggle = false, ...props },
  ref,
) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const isPasswordType = type === 'password' || showPasswordToggle;
  const inputType = isPasswordType && isPasswordVisible ? 'text' : type;

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible((prev) => !prev);
  }, []);

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="relative w-full">
        <input
          ref={ref}
          type={inputType}
          className={`${inputBase} ${error ? inputVariants.error : inputVariants.default} ${isPasswordType ? 'pr-12' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${props.id ?? props.name}-error` : undefined}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-white/70 transition-colors hover:text-white"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={(props.id ?? props.name) ? `${props.id ?? props.name}-error` : undefined}
          className="text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
      />
    </svg>
  );
}
