import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { RemoveScroll } from 'react-remove-scroll';

import { Loader } from '@/ui/Loader';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { searchableSelectTriggerClass, selectItemInputClass } from '@/ui/Select';

function ChevronIcon({ className = '' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}

/**
 * Popover combobox with client-side search filtering.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} [props.placeholder]
 * @param {string} [props.searchPlaceholder]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.readOnly]
 * @param {boolean} [props.loading]
 * @param {string} [props.id]
 * @param {string} [props.className]
 * @param {string} [props.ariaLabel]
 */
export function SearchableSelect({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled = false,
  readOnly = false,
  loading = false,
  id,
  className = '',
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchRef = useRef(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightIndex(options.findIndex((o) => o.value === value));
    }
  }, [open]);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';
  const displayValue = selectedLabel || value || '';

  if (readOnly) {
    return (
      <input
        id={id}
        type="text"
        readOnly
        value={displayValue}
        className={`${searchableSelectTriggerClass} text-white ${className}`.trim()}
        aria-readonly="true"
      />
    );
  }

  const isDisabled = disabled || loading;

  function selectOption(optionValue) {
    onChange(optionValue);
    setOpen(false);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0) {
        const option = filtered[highlightIndex];
        if (option) selectOption(option.value);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          className={`flex items-center justify-between ${searchableSelectTriggerClass} ${className}`.trim()}
        >
          <span className={`min-w-0 flex-1 truncate text-left ${displayValue ? 'text-white' : 'text-muted/47'}`}>
            {displayValue || placeholder}
          </span>
          {loading ? <Loader size="xs" /> : <ChevronIcon className="shrink-0 text-white" />}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="z-[110] w-[var(--radix-popover-trigger-width)] !rounded-xl !border-0 !bg-[#141412] !p-0 shadow-lg"
      >
        {/* RemoveScroll takes over the lockStack when this portal is open so that
            react-remove-scroll (mounted by the parent Dialog) no longer treats
            touch/wheel events here as "outside" and calls preventDefault on them. */}
        <RemoveScroll enabled={open} removeScrollBar={false} className="flex flex-col">
          <div className="border-b border-white/10 p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
              className="h-10 w-full rounded-md bg-[#1C1C1A] px-3 text-sm text-white placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#FF9700]/50 focus:outline-none"
              aria-controls={listId}
              aria-label={searchPlaceholder}
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            className="max-h-60 overflow-y-auto p-1 [scrollbar-width:thin]"
            aria-label={ariaLabel ?? placeholder}
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-center text-sm text-[#A2A6AB]">No results found</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightIndex;
                return (
                  <li key={`${option.value}-${option.label}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectOption(option.value)}
                      className={`${selectItemInputClass} w-full text-left ${
                        isHighlighted || isSelected ? '!bg-white/10' : ''
                      }`.trim()}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </RemoveScroll>
      </PopoverContent>
    </Popover>
  );
}
