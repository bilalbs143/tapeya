import { cn } from '@/shared/lib/cn';

type AdminActionChoiceRowProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
};

export function AdminActionChoiceRow({ selected, onClick, title }: AdminActionChoiceRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'focus-visible:outline-brand flex min-h-11 items-center gap-2.5 rounded-icon border px-3 text-left text-2xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2',
        selected ? 'border-brand bg-surface text-ink' : 'border-border-subtle bg-surface text-body'
      )}
    >
      <span
        className={cn(
          'grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px]',
          selected ? 'border-brand border-[4.5px]' : 'border-dim'
        )}
      />
      {title}
    </button>
  );
}
