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

import { EXTRA_RUN_OPTIONS } from '../lib/extraRunOptions';
import type { UiBall } from '../lib/storeBallPayload';
import { computeWideBallEquation, wideBallSelectionToUiFields } from '../lib/wideBallExtras';

type WideBallSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (ball: Pick<UiBall, 'type' | 'extraRuns'>) => void;
};

export function WideBallSheet({ open, onOpenChange, onConfirm }: WideBallSheetProps) {
  const [extraRuns, setExtraRuns] = useState(0);
  const equation = computeWideBallEquation(extraRuns);

  function reset() {
    setExtraRuns(0);
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
        <DialogTitle>Wide</DialogTitle>
        <DialogDescription>Mandatory wide plus any extra runs taken.</DialogDescription>
      </DialogHeader>

      <DialogBody>
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
                WB+{runs}
              </button>
            );
          })}
        </div>
        <p className="text-muted text-center text-2xs leading-snug">{equation.text}</p>
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
          onClick={() => {
            onConfirm(wideBallSelectionToUiFields(extraRuns));
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
