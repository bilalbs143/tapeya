type AdminActionInlineStepperProps = {
  value: number;
  onBump: (d: number) => void;
};

export function AdminActionInlineStepper({ value, onBump }: AdminActionInlineStepperProps) {
  return (
    <div className="border-border-subtle bg-surface flex min-h-12 items-center rounded-icon border pr-1.5 pl-3.5">
      <span className="font-mono flex-1 text-title-sm font-extrabold text-ink">{value}</span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onBump(-1)}
          aria-label="Fewer Runs"
          className="border-border-subtle bg-surface text-muted focus-visible:outline-brand font-mono grid h-11 w-11 place-items-center rounded-icon border text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onBump(1)}
          aria-label="More Runs"
          className="border-border-subtle bg-surface text-muted focus-visible:outline-brand font-mono grid h-11 w-11 place-items-center rounded-icon border text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          +
        </button>
      </div>
    </div>
  );
}
