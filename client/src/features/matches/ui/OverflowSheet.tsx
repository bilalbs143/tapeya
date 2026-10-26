import type { ReactNode } from 'react';

import { BaseDialog, DialogBody, DialogDescription, DialogHeader, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';

export type OverflowAction = 'overthrow_wide' | 'overthrow_nb' | 'wicket_wide' | 'wicket_nb' | 'penalty' | 'retire';

type OverflowSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overNum?: number | undefined;
  ballInOver?: number | undefined;
  strikerName?: string | null | undefined;
  onAction: (action: OverflowAction) => void;
};

export function OverflowSheet({
  open,
  onOpenChange,
  overNum = 1,
  ballInOver = 1,
  strikerName,
  onAction,
}: OverflowSheetProps) {
  function pick(action: OverflowAction) {
    onOpenChange(false);
    onAction(action);
  }

  const meta = [`Over ${overNum}`, `Ball ${ballInOver}`, strikerName ? `${strikerName} on strike` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>More Ball Outcomes</DialogTitle>
        <DialogDescription className="font-mono text-3xs leading-normal font-medium uppercase">
          {meta}
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="max-h-[70vh] overflow-y-auto">
        <Section label="Overthrows">
          <div className="grid grid-cols-2 gap-2">
            <GridRow label="Overthrow on a Wide" onClick={() => pick('overthrow_wide')} />
            <GridRow label="Overthrow on a No-Ball" onClick={() => pick('overthrow_nb')} />
          </div>
        </Section>

        <Section label="Wicket on an Illegal Ball">
          <div className="grid grid-cols-2 gap-2">
            <GridRow label="Wicket off a Wide" tone="danger" onClick={() => pick('wicket_wide')} />
            <GridRow label="Wicket off a No-Ball" tone="danger" onClick={() => pick('wicket_nb')} />
          </div>
        </Section>

        <Section label="Off the Ball">
          <div className="flex flex-col gap-2">
            <ListRow
              title="Penalty Runs"
              hint="Awarded to either side, no ball bowled"
              badge="+5"
              onClick={() => pick('penalty')}
            />
            <ListRow title="Retired Hurt" hint="Striker leaves, pick a replacement" onClick={() => pick('retire')} />
          </div>
        </Section>

        <p className="text-dim text-[11px] leading-relaxed">
          Rare events belong behind one tap, not in the way of every ball.
        </p>
      </DialogBody>
    </BaseDialog>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-dim mb-2.5 text-4xs leading-normal font-bold tracking-eyebrow uppercase">{label}</p>
      {children}
    </div>
  );
}

function GridRow({ label, onClick, tone = 'ink' }: { label: string; onClick: () => void; tone?: 'ink' | 'danger' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-13 items-center justify-center rounded-field border px-2 text-center text-xs leading-normal font-bold',
        tone === 'danger' ? 'border-danger/45 bg-surface text-danger-soft' : 'border-border-subtle bg-surface text-ink'
      )}
    >
      {label}
    </button>
  );
}

function ListRow({
  title,
  hint,
  badge,
  onClick,
}: {
  title: string;
  hint?: string | undefined;
  badge?: string | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border-subtle bg-surface flex min-h-13 items-center gap-3 rounded-field border px-3.5 py-3 text-left"
    >
      {badge ? (
        <span className="bg-page-deep font-mono text-body grid h-8 w-8 shrink-0 place-items-center rounded-icon text-2xs leading-normal font-extrabold">
          {badge}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-bold text-ink">{title}</p>
        {hint ? <p className="text-muted mt-0.5 text-2xs leading-snug">{hint}</p> : null}
      </div>
      {!badge ? (
        <span className="text-dim shrink-0 text-lg font-light" aria-hidden>
          ›
        </span>
      ) : null}
    </button>
  );
}
