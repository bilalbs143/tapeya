import { useState } from 'react';

import { useNoBallOptions } from '@/shared/api/enumsApi';
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
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { EXTRA_RUN_OPTIONS } from '../lib/extraRunOptions';
import { computeNoBallEquation, noBallSelectionToUiFields } from '../lib/noBallExtras';
import type { UiBall } from '../lib/storeBallPayload';

type NoBallSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    ball: Pick<
      UiBall,
      'type' | 'noBallType' | 'noBallRunsType' | 'runsOffBat' | 'extraRuns' | 'byeOnNoBall' | 'legByeOnNoBall'
    >
  ) => void;
};

export function NoBallSheet({ open, onOpenChange, onConfirm }: NoBallSheetProps) {
  const { typeOptions, runsTypeOptions, isLoading, isError, refetch } = useNoBallOptions();
  const [noBallType, setNoBallType] = useState<string | null>(null);
  const [noBallRunsType, setNoBallRunsType] = useState<string | null>(null);
  const [extraRuns, setExtraRuns] = useState(0);

  // Reset on open or when enum options load — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevTypeOptions, setPrevTypeOptions] = useState(typeOptions);
  const [prevRunsTypeOptions, setPrevRunsTypeOptions] = useState(runsTypeOptions);
  if (open !== prevOpen || typeOptions !== prevTypeOptions || runsTypeOptions !== prevRunsTypeOptions) {
    setPrevOpen(open);
    setPrevTypeOptions(typeOptions);
    setPrevRunsTypeOptions(runsTypeOptions);
    if (open) {
      setExtraRuns(0);
      setNoBallType(typeOptions[0]?.value ?? null);
      setNoBallRunsType(runsTypeOptions[0]?.value ?? null);
    }
  }

  const equation = computeNoBallEquation(extraRuns);
  const enumsReady = typeOptions.length > 0 && runsTypeOptions.length > 0;
  const canContinue = enumsReady && Boolean(noBallType && noBallRunsType);

  function reset() {
    setNoBallType(null);
    setNoBallRunsType(null);
    setExtraRuns(0);
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogHeader>
        <DialogTitle>No Ball</DialogTitle>
        <DialogDescription>Type and runs are prefilled — change only if you need to.</DialogDescription>
      </DialogHeader>

      <DialogBody>
        {isError ? (
          <ErrorState
            title="Couldn’t Load No-Ball Options"
            description="Types come from the server."
            onRetry={() => void refetch()}
          />
        ) : isLoading && !enumsReady ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading No-Ball Options">
            <Skeleton className="h-10 w-full rounded-panel" />
            <Skeleton className="h-10 w-full rounded-panel" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => {
                const selected = noBallType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setNoBallType(opt.value)}
                    className={cn(
                      'min-h-10 rounded-field border px-3 text-2xs font-bold',
                      selected ? 'border-brand bg-brand/12 text-brand-text' : 'border-border-subtle bg-surface text-ink'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {runsTypeOptions.map((opt) => {
                const selected = noBallRunsType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setNoBallRunsType(opt.value)}
                    className={cn(
                      'min-h-10 rounded-field border px-3 text-2xs font-bold',
                      selected ? 'border-brand bg-brand/12 text-brand-text' : 'border-border-subtle bg-surface text-ink'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {EXTRA_RUN_OPTIONS.map((runs) => {
                const selected = extraRuns === runs;
                return (
                  <button
                    key={runs}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setExtraRuns(runs)}
                    className={cn(
                      'font-mono min-h-11 min-w-14 rounded-panel border px-3 text-sm font-extrabold',
                      selected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-ink'
                    )}
                  >
                    NB+{runs}
                  </button>
                );
              })}
            </div>
            <p className="text-muted text-center text-2xs leading-snug">{equation.text}</p>
          </>
        )}
      </DialogBody>

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
        <Button
          disabled={!canContinue}
          onClick={() => {
            if (!noBallType || !noBallRunsType) return;
            onConfirm(
              noBallSelectionToUiFields({
                extraRuns,
                noBallType,
                noBallRunsType,
              })
            );
            reset();
            onOpenChange(false);
          }}
        >
          Confirm
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
