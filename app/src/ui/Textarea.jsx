/**
 * Shared textarea — default form size and compact composer size (comments, etc.).
 */

import { forwardRef, useCallback, useLayoutEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

const areaBase = 'w-full rounded-[6px] bg-surface text-white focus:outline-none focus:ring-2 transition-colors';

const areaSizes = {
  /** Standard form fields */
  default: 'min-h-[144px] resize-y px-4 py-3 text-base placeholder:text-base placeholder:text-muted/47',
  /**
   * Comment / chat composer.
   * Normal text-sm leading (not leading-9) so wrapped lines are not huge.
   * min-h-9 keeps a comfortable empty/single-line box; JS grows carefully.
   */
  compact:
    'min-h-9 max-h-28 resize-none overflow-y-auto px-0 py-1.5 text-sm leading-5 placeholder:text-sm placeholder:leading-5 placeholder:text-muted/47',
};

const areaVariants = {
  default: 'focus:ring-[#FF9700]/50',
  error: 'focus:ring-red-500/50',
};

const COMPACT_MIN_PX = 36;
const COMPACT_MAX_PX = 112;

function assignRef(ref, node) {
  if (typeof ref === 'function') ref(node);
  else if (ref && typeof ref === 'object') ref.current = node;
}

function syncCompactHeight(el) {
  if (!el) return;
  const minH = Number.parseFloat(getComputedStyle(el).minHeight) || COMPACT_MIN_PX;
  const maxH = Number.parseFloat(getComputedStyle(el).maxHeight) || COMPACT_MAX_PX;

  // Measure from the floor — never collapse to 0/auto (avoids empty→type shrink).
  el.style.height = `${minH}px`;
  const next = Math.min(Math.max(el.scrollHeight, minH), maxH);
  el.style.height = `${next}px`;
  el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
}

export const Textarea = forwardRef(function Textarea(
  { className = '', error, rows, size = 'default', onChange, value, defaultValue, ...props },
  ref,
) {
  const localRef = useRef(null);
  const isCompact = size === 'compact';

  const setRefs = useCallback(
    (node) => {
      localRef.current = node;
      assignRef(ref, node);
      if (node && size === 'compact') syncCompactHeight(node);
    },
    [ref, size],
  );

  const resolvedRows = rows ?? (isCompact ? 1 : 6);

  useLayoutEffect(() => {
    if (!isCompact) return;
    syncCompactHeight(localRef.current);
  }, [isCompact, value, defaultValue]);

  const handleChange = (event) => {
    onChange?.(event);
    if (isCompact) syncCompactHeight(event.target);
  };

  return (
    <div className={cn('flex w-full flex-col', error ? 'gap-1' : null)}>
      <textarea
        {...props}
        ref={setRefs}
        rows={resolvedRows}
        {...(value !== undefined ? { value } : null)}
        {...(defaultValue !== undefined ? { defaultValue } : null)}
        onChange={handleChange}
        className={cn(
          areaBase,
          areaSizes[size] ?? areaSizes.default,
          error ? areaVariants.error : areaVariants.default,
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${props.id ?? props.name}-error` : undefined}
      />
      {error ? (
        <p
          id={(props.id ?? props.name) ? `${props.id ?? props.name}-error` : undefined}
          className="text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});
