import { cn } from '@/shared/lib/cn';
import { MinusIcon, PlusIcon } from '@/shared/ui/icons';

export type NumberStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number | undefined;
  max?: number | undefined;
  /** Accessible label for the minus control. */
  decreaseLabel?: string | undefined;
  /** Accessible label for the plus control. */
  increaseLabel?: string | undefined;
  /**
   * `field` — full-width form control (overs, teams, groups).
   * `inline` — compact qty control (product detail / cart).
   */
  variant?: 'field' | 'inline' | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

/** Shared − / value / + control for integer form fields. */
export function NumberStepper({
  value,
  onChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  decreaseLabel = 'Decrease',
  increaseLabel = 'Increase',
  variant = 'field',
  disabled = false,
  className,
}: NumberStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;
  const step = (delta: -1 | 1) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  };

  if (variant === 'inline') {
    return (
      <div className={cn('border-border-subtle bg-surface inline-flex items-center rounded-panel border', className)}>
        <StepControl
          label={decreaseLabel}
          kind="decrease"
          disabled={!canDecrease}
          onClick={() => step(-1)}
          className="h-11 w-11 rounded-l-panel disabled:opacity-30"
          iconClassName="h-3.5 w-3.5"
          iconStroke={2.6}
        />
        <span
          aria-live="polite"
          className="font-mono w-9 text-center text-sm leading-normal font-bold text-ink tabular-nums"
        >
          {value}
        </span>
        <StepControl
          label={increaseLabel}
          kind="increase"
          disabled={!canIncrease}
          onClick={() => step(1)}
          className="h-11 w-11 rounded-r-panel disabled:opacity-30"
          iconClassName="h-3.5 w-3.5"
          iconStroke={2.6}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border bg-surface flex h-12 w-full items-center justify-between rounded-panel border px-2',
        className
      )}
    >
      <StepControl
        label={decreaseLabel}
        kind="decrease"
        disabled={!canDecrease}
        onClick={() => step(-1)}
        className="h-9 w-9 rounded-icon disabled:opacity-40"
        iconClassName="h-4 w-4"
        iconStroke={2.2}
      />
      <span aria-live="polite" className="font-mono text-base leading-normal font-extrabold text-ink tabular-nums">
        {value}
      </span>
      <StepControl
        label={increaseLabel}
        kind="increase"
        disabled={!canIncrease}
        onClick={() => step(1)}
        className="h-9 w-9 rounded-icon disabled:opacity-40"
        iconClassName="h-4 w-4"
        iconStroke={2.2}
      />
    </div>
  );
}

function StepControl({
  label,
  kind,
  disabled,
  onClick,
  className,
  iconClassName,
  iconStroke,
}: {
  label: string;
  kind: 'increase' | 'decrease';
  disabled: boolean;
  onClick: () => void;
  className?: string | undefined;
  iconClassName: string;
  iconStroke: number;
}) {
  const Icon = kind === 'increase' ? PlusIcon : MinusIcon;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn('text-body focus-visible:outline-brand grid place-items-center focus-visible:outline-2', className)}
    >
      <Icon className={iconClassName} strokeWidth={iconStroke} />
    </button>
  );
}
