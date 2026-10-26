import { useState } from 'react';

import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Textarea } from '@/shared/ui/Input';

type DeclareResultSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  home: { id: number; short: string; name: string };
  away: { id: number; short: string; name: string };
  saving?: boolean | undefined;
  onConfirm: (payload: {
    declareResultType: 'award' | 'draw';
    winnerTeamId: number | null;
    declareResultNote: string | null;
  }) => void;
};

/** Declare Results — award a side or draw (app DeclareResultDialog contract, */

export function DeclareResultSheet({
  open,
  onOpenChange,
  home,
  away,
  saving = false,
  onConfirm,
}: DeclareResultSheetProps) {
  const [type, setType] = useState<'award' | 'draw' | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [note, setNote] = useState('');

  // Reset on open — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setType(null);
      setWinnerId(null);
      setNote('');
    }
  }

  const canApply = type === 'draw' || (type === 'award' && winnerId != null);

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Declare Result</DialogTitle>
        <DialogDescription>
          For results scoring can&apos;t produce — a walkover, an awarded match, a washout with no play.
        </DialogDescription>
      </DialogHeader>

      <Form
        id="declare-result-form"
        density="compact"
        onSubmit={(e) => {
          e.preventDefault();
          if (!type || !canApply) return;
          onConfirm({
            declareResultType: type,
            winnerTeamId: type === 'award' ? winnerId : null,
            declareResultNote: note.trim() || null,
          });
        }}
      >
        <DialogBody>
          <Field label="How You Want to Proceed" required>
            <div className="flex gap-2">
              <ChoiceCard
                selected={type === 'award'}
                title="Award"
                hint="Pick a winner"
                onClick={() => {
                  setType('award');
                  setWinnerId(null);
                }}
              />
              <ChoiceCard
                selected={type === 'draw'}
                title="Draw"
                hint="No winner"
                onClick={() => {
                  setType('draw');
                  setWinnerId(null);
                }}
              />
            </div>
          </Field>

          {type === 'award' ? (
            <Field label="Winner" required>
              <div className="flex flex-col gap-1.5">
                <ThenRow
                  selected={winnerId === home.id}
                  title={`${home.short} win`}
                  hint={home.name}
                  onClick={() => setWinnerId(home.id)}
                />
                <ThenRow
                  selected={winnerId === away.id}
                  title={`${away.short} win`}
                  hint={away.name}
                  onClick={() => setWinnerId(away.id)}
                />
              </div>
            </Field>
          ) : null}

          {type === 'draw' ? (
            <p className="border-border-subtle bg-surface text-muted rounded-field border px-3 py-2.5 text-2xs leading-snug">
              This declares the match a <span className="font-semibold text-ink">draw</span>. It cannot be undone.
            </p>
          ) : null}

          {type ? (
            <Textarea
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Walkover — away side unable to field…"
              className="min-h-15.5 text-2xs"
            />
          ) : null}
        </DialogBody>
      </Form>

      <DialogFooter>
        <Button
          type="submit"
          form="declare-result-form"
          variant="danger"
          size="md"
          disabled={!canApply}
          loading={saving}
        >
          Declare &amp; Close Match
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}

function ChoiceCard({
  selected,
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'focus-visible:outline-brand flex min-h-16 flex-1 flex-col items-center justify-center rounded-field border px-3 text-center focus-visible:outline-2 focus-visible:outline-offset-2',
        selected ? 'border-brand bg-brand/10' : 'border-border-subtle bg-surface'
      )}
    >
      <span className="text-xs font-extrabold text-ink uppercase">{title}</span>
      <span className="text-dim mt-0.5 text-3xs">{hint}</span>
    </button>
  );
}

function ThenRow({
  selected,
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'focus-visible:outline-brand flex min-h-11.5 items-center gap-2.5 rounded-field border px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2',
        selected ? 'border-brand bg-surface' : 'border-border-subtle bg-surface'
      )}
    >
      <span
        className={cn(
          'grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px]',
          selected ? 'border-brand border-[4.5px]' : 'border-dim'
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-ink">{title}</span>
        <span className="text-dim block truncate text-4xs">{hint}</span>
      </span>
    </button>
  );
}
