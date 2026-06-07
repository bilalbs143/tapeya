import { forwardRef } from 'react';

const areaBase =
  'min-h-[144px] w-full resize-y rounded-[6px] bg-surface px-4 py-3 text-white placeholder:text-base placeholder:text-muted/47 focus:outline-none focus:ring-2 transition-colors';

const areaVariants = {
  default: 'focus:ring-[#FF9700]/50',
  error: 'focus:ring-red-500/50',
};

export const Textarea = forwardRef(function Textarea({ className = '', error, rows = 6, ...props }, ref) {
  return (
    <div className="flex w-full flex-col gap-1">
      <textarea
        ref={ref}
        rows={rows}
        className={`${areaBase} ${error ? areaVariants.error : areaVariants.default} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${props.id ?? props.name}-error` : undefined}
        {...props}
      />
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
