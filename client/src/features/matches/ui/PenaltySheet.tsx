import { useState } from 'react';

import { useGetEnumsQuery } from '@/shared/api/enumsApi';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { enumOptions } from '@/shared/model/enums';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import type { UiBall } from '../lib/storeBallPayload';

const PENALTY_RUN_PRESETS = [1, 5] as const;

type PenaltySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (ball: Pick<UiBall, 'type' | 'penaltyRuns' | 'penaltyTeam' | 'penaltyReason'>) => void;
};

export function PenaltySheet({ open, onOpenChange, onConfirm }: PenaltySheetProps) {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  const teamOptions = enumOptions(enums, 'penalty_team');
  const reasonOptions = enumOptions(enums, 'penalty_reason');
  const [team, setTeam] = useState<string | null>(null);
  const [runs, setRuns] = useState(5);
  const [reason, setReason] = useState<string | null>(null);

  // Reset on open or when team options load — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevTeamOptions, setPrevTeamOptions] = useState(teamOptions);
  if (open !== prevOpen || teamOptions !== prevTeamOptions) {
    setPrevOpen(open);
    setPrevTeamOptions(teamOptions);
    if (open) {
      setRuns(5);
      setReason(null);
      setTeam(teamOptions[0]?.value ?? 'batting');
    }
  }

  const canContinue = Boolean(team) && runs > 0;

  function reset() {
    setTeam(null);
    setRuns(5);
    setReason(null);
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      sheet
      contentClassName="tab:max-w-dialog"
    >
      <DialogHeader>
        <DialogTitle>Penalty Runs</DialogTitle>
        <DialogDescription>Awarded to either side — no ball is bowled.</DialogDescription>
      </DialogHeader>

      <Form
        id="penalty-form"
        density="compact"
        onSubmit={(e) => {
          e.preventDefault();
          if (!team || !canContinue) return;
          onConfirm({
            type: 'penalty',
            penaltyRuns: runs,
            penaltyTeam: team,
            penaltyReason: reason,
          });
          reset();
          onOpenChange(false);
        }}
      >
        <DialogBody>
          {isError ? (
            <ErrorState title="Couldn’t Load Penalty Options" onRetry={() => void refetch()} />
          ) : isLoading && teamOptions.length === 0 ? (
            <Skeleton className="h-11 w-full rounded-panel" />
          ) : (
            <>
              <Field label="Award To" required>
                <div className="grid grid-cols-2 gap-2">
                  {teamOptions.map((opt) => {
                    const selected = team === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setTeam(opt.value)}
                        className={cn(
                          'min-h-11 rounded-panel border text-sm font-bold',
                          selected
                            ? 'border-brand bg-brand/12 text-brand-text'
                            : 'border-border-subtle bg-surface text-ink'
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Runs" required>
                <div className="flex flex-wrap gap-2">
                  {PENALTY_RUN_PRESETS.map((value) => {
                    const selected = runs === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setRuns(value)}
                        className={cn(
                          'font-mono min-h-11 min-w-14 rounded-panel border text-sm font-extrabold',
                          selected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-ink'
                        )}
                      >
                        +{value}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {reasonOptions.length > 0 ? (
                <Field label="Reason">
                  <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                    {reasonOptions.map((opt) => {
                      const selected = reason === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setReason(selected ? null : opt.value)}
                          className={cn(
                            'min-h-10 rounded-field border px-3 text-left text-2xs font-bold',
                            selected
                              ? 'border-brand bg-brand/12 text-brand-text'
                              : 'border-border-subtle bg-surface text-ink'
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              ) : null}
            </>
          )}
        </DialogBody>
      </Form>

      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            onOpenChange(false);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" form="penalty-form" disabled={!canContinue}>
          Award +{runs}
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
