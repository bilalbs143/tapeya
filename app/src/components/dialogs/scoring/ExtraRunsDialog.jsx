import { BaseDialog } from '@/components/dialogs/BaseDialog';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

const RUNS_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Shown when organizer taps WD, NB, Bye or LB. They can choose runs from this delivery (0–6).
 */
export function ExtraRunsDialog({ open, onOpenChange, onSelect }) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          Runs from this delivery?
        </DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="flex flex-col">
        <div className="flex flex-wrap justify-center gap-2 py-2">
          {RUNS_OPTIONS.map((runs) => (
            <button
              key={runs}
              type="button"
              onClick={() => {
                onSelect(runs);
                onOpenChange(false);
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#141412] text-[16px] font-bold text-white transition-opacity hover:bg-[#1c1c1a] active:opacity-80"
              aria-label={`${runs} run${runs !== 1 ? 's' : ''}`}
            >
              {runs}
            </button>
          ))}
        </div>
      </DialogScrollBody>
    </BaseDialog>
  );
}

export default ExtraRunsDialog;
