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
import type { ExtraCode } from './ScoringPad';

type ExtraRunsSheetProps = {
  open: boolean;
  kind: Extract<ExtraCode, 'bye' | 'lb'> | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (kind: 'bye' | 'lb', runs: number) => void;
};

const TITLES = {
  bye: 'Bye',
  lb: 'Leg Bye',
} as const;

export function ExtraRunsSheet({ open, kind, onOpenChange, onConfirm }: ExtraRunsSheetProps) {
  const [runs, setRuns] = useState(1);

  function reset() {
    setRuns(1);
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
        <DialogTitle>{kind ? TITLES[kind] : 'Extras'}</DialogTitle>
        <DialogDescription>How many runs?</DialogDescription>
      </DialogHeader>

      <DialogBody>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {EXTRA_RUN_OPTIONS.map((value) => {
            const selected = runs === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setRuns(value)}
                className={cn(
                  'font-mono min-h-12 rounded-panel border text-lg font-extrabold',
                  selected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-ink'
                )}
              >
                {value}
              </button>
            );
          })}
        </div>
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
          disabled={kind == null}
          onClick={() => {
            if (!kind) return;
            onConfirm(kind, runs);
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
