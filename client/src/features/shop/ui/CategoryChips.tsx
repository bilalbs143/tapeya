import { cn } from '@/shared/lib/cn';
import { HScroll } from '@/shared/ui/HScroll';

import type { ShopCategory } from '../model/schemas';

type CategoryChipsProps = {
  categories?: ShopCategory[] | undefined;
  value?: number | null | undefined;
  onChange?: ((categoryId: number | null) => void) | undefined;
  className?: string | undefined;
};

export function CategoryChips({ categories = [], value = null, onChange, className }: CategoryChipsProps) {
  if (!categories.length) return null;

  return (
    <HScroll className={cn('gap-1.5', className)} role="tablist" aria-label="Categories">
      <button
        type="button"
        role="tab"
        aria-selected={value == null}
        onClick={() => onChange?.(null)}
        className={cn(
          'focus-visible:outline-brand shrink-0 rounded-chip px-3 py-1.5 text-2xs leading-normal font-bold whitespace-nowrap focus-visible:outline-2',
          value == null ? 'bg-brand text-white' : 'bg-surface border-border-subtle text-muted hover:text-ink border'
        )}
      >
        All
      </button>
      {categories.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(c.id)}
            className={cn(
              'focus-visible:outline-brand shrink-0 rounded-chip px-3 py-1.5 text-2xs leading-normal font-bold whitespace-nowrap focus-visible:outline-2',
              active ? 'bg-brand text-white' : 'bg-surface border-border-subtle text-muted hover:text-ink border'
            )}
          >
            {c.name}
          </button>
        );
      })}
    </HScroll>
  );
}
