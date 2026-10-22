import { type ComponentProps, forwardRef, type ReactNode, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { CloseIcon, SearchIcon } from '@/shared/ui/icons';

/** Always has aria-label; clear control only when there is text to clear. */
export type SearchBarProps = Omit<ComponentProps<'input'>, 'onChange' | 'size' | 'type' | 'value'> & {
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  onClear?: (() => void) | undefined;
  label?: string | undefined;
  /** Announced when results change (polite live region). */
  count?: ReactNode;
  size?: 'sm' | 'md' | undefined;
  inputClassName?: string | undefined;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    value,
    onValueChange,
    onClear,
    placeholder = 'Search',
    label = 'Search',
    count,
    size = 'md',
    className,
    inputClassName,
    id: idProp,
    ...props
  },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  const hasValue = Boolean(value);

  const clear = () => {
    onValueChange?.('');
    onClear?.();
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className={cn(
          'bg-surface border-border focus-within:outline-brand flex items-center gap-2 rounded-field border px-3 focus-within:outline-2',
          size === 'sm' ? 'h-9' : 'h-11'
        )}
      >
        <SearchIcon className="text-muted h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        <input
          ref={ref}
          id={id}
          type="search"
          inputMode="search"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          className={cn(
            'placeholder:text-muted/80 min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none',
            /* Hide WebKit clear — custom clear button */
            '[&::-webkit-search-cancel-button]:appearance-none',
            inputClassName
          )}
          {...props}
        />
        {hasValue ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear Search"
            className="text-dim hover:text-ink focus-visible:outline-brand grid h-6 w-6 shrink-0 place-items-center rounded-full focus-visible:outline-2"
          >
            <CloseIcon className="h-3 w-3" strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
      {count != null ? (
        <span className="text-dim text-2xs" aria-live="polite">
          {count}
        </span>
      ) : null}
    </div>
  );
});
