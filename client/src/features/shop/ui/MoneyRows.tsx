import { cn } from '@/shared/lib/cn';

type MoneyRow = [label: string, value: string, tone?: 'positive' | undefined];

type MoneyRowsProps = {
  rows?: MoneyRow[] | undefined;
  total?: string | undefined;
  className?: string | undefined;
};

export function MoneyRows({ rows = [], total, className }: MoneyRowsProps) {
  return (
    <dl className={cn('flex flex-col gap-1.5', className)}>
      {rows.map(([label, value, tone]) => (
        <div key={label} className="flex items-baseline justify-between">
          <dt className="text-muted text-2xs leading-normal">{label}</dt>
          <dd
            className={cn(
              'font-mono text-2xs leading-normal font-semibold tabular-nums',
              tone === 'positive' ? 'text-positive-2' : 'text-body'
            )}
          >
            {value}
          </dd>
        </div>
      ))}
      {total ? (
        <div className="border-border-subtle mt-1.5 flex items-baseline justify-between border-t pt-2.5">
          <dt className="text-body-sm font-extrabold text-ink">Total</dt>
          <dd className="font-mono text-body-lg leading-normal font-extrabold text-ink tabular-nums">{total}</dd>
        </div>
      ) : null}
    </dl>
  );
}
