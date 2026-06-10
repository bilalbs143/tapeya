import { Button } from '@/ui/Button';
import { PlusIcon } from '@/ui/icons/ScoringTableIcons';

/**
 * Shared "Add …" CTA for scoring tables (batsman, bowler, etc.).
 *
 * @param {object}   props
 * @param {string}   props.label     Role name shown after "Add" (e.g. "Batsman", "Bowler").
 * @param {Function} props.onClick
 * @param {string}   [props.className]
 */
export function ScoringTableAddButton({ label, onClick, className = '' }) {
  const addLabel = `Add ${label}`;

  return (
    <Button
      type="button"
      variant="dark"
      size="md"
      className={`flex flex-col items-center gap-1.5 ${className}`.trim()}
      aria-label={addLabel}
      onClick={onClick}
    >
      <span className="bg-brand text-ink flex h-8 w-8 items-center justify-center rounded-full">
        <PlusIcon />
      </span>
      <span className="text-muted text-[13px] font-bold tracking-wide uppercase">{addLabel}</span>
    </Button>
  );
}
