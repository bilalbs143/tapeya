import { type RefObject } from 'react';

import { formatHashtagLabel } from '@/shared/lib/hashtags';

type HashtagChipFieldProps = {
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Shown when collapsed and value is empty. */
  emptyLabel?: string | undefined;
  /** Optional preformatted collapsed label; defaults to formatHashtagLabel(value). */
  label?: string | undefined;
};

/**
 * Compact # chip used on create post (plain) and create reel details.
 * Controlled — parent owns value / editing / focus ref.
 */
export function HashtagChipField({
  value,
  onChange,
  editing,
  onEditingChange,
  inputRef,
  emptyLabel = 'Hashtags',
  label,
}: HashtagChipFieldProps) {
  const collapsedLabel = label ?? (value.trim() ? formatHashtagLabel(value) : emptyLabel);

  if (editing) {
    return (
      <span className="border-border-subtle bg-surface inline-flex min-h-[30px] max-w-[70%] items-center gap-1.5 rounded-field border px-3">
        <span className="font-mono text-xs font-extrabold text-brand-text">#</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/^#+\s*/, ''))}
          onBlur={() => onEditingChange(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditingChange(false);
          }}
          placeholder="final tapeball"
          aria-label="Hashtags"
          className="text-body min-w-0 flex-1 bg-transparent text-3xs font-bold outline-none"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onEditingChange(true)}
      className="border-border-subtle bg-surface text-body inline-flex min-h-[30px] items-center gap-1.5 rounded-field border px-3 text-3xs font-bold"
    >
      <span className="font-mono text-xs font-extrabold text-brand-text">#</span>
      {collapsedLabel}
    </button>
  );
}
