import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { UndoIcon } from '@/shared/ui/icons';

import type { WicketSummaryModel } from '../lib/wicketSummary';
import type { useWicketSummary } from './useWicketSummary';

type WicketSummaryFlow = ReturnType<typeof useWicketSummary>;

type WicketSummaryBodyProps = {
  open: boolean;
  model: WicketSummaryModel;
  flow: WicketSummaryFlow;
  undoing: boolean;
  onUndo: () => void;
  onProceed: () => void;
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-icon px-2 py-2.5 text-center">
      <p className="font-mono text-dim mb-1 text-4xs leading-normal font-bold tracking-eyebrow uppercase">{label}</p>
      <p className="font-mono text-body-sm font-extrabold text-ink">{value}</p>
    </div>
  );
}

/** Non-dismissible wicket sheet — Undo or Proceed only. */
export function WicketSummaryBody({ open, model, flow, undoing, onUndo, onProceed }: WicketSummaryBodyProps) {
  const { scoreHero, oversLine, partnershipValue, boundariesValue } = flow;

  return (
    <BaseDialog
      open={open}
      onOpenChange={() => {}}
      sheet
      dismissible={false}
      showClose={false}
      contentClassName="tab:max-w-dialog gap-0 overflow-hidden p-0"
    >
      <div className="bg-danger px-5 pt-4 pb-4">
        <p className="mb-1.5 font-mono text-4xs leading-normal font-extrabold tracking-eyebrow text-white/75 uppercase">
          {model.chipLabel}
        </p>
        <p className="text-display-sm leading-none font-extrabold tracking-tight text-white">
          {model.battingShort} {scoreHero}
        </p>
        {oversLine ? (
          <p className="mt-1.5 font-mono text-2xs leading-normal font-semibold text-white/80">{oversLine}</p>
        ) : null}
        {model.chaseLine ? (
          <p className="mt-2 text-2xs leading-snug font-medium text-white/85">{model.chaseLine}</p>
        ) : null}
      </div>

      <DialogHeader className="sr-only">
        <DialogTitle>Wicket</DialogTitle>
        <DialogDescription>
          {model.batter.name} — {model.howLine}. Undo or proceed to pick the next batter.
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        <div className="border-border-subtle flex items-center gap-3 rounded-panel border p-3.5">
          <Avatar name={model.batter.name} size="lg" className="h-11 w-11 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-normal font-extrabold text-ink">{model.batter.name}</p>
            <p className="text-dim mt-0.5 truncate text-3xs leading-normal font-medium">{model.howLine}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-title leading-none font-extrabold text-ink">{model.batter.runs}</p>
            <p className="font-mono text-dim mt-0.5 text-3xs leading-normal font-semibold uppercase">
              {model.batter.balls} balls
            </p>
          </div>
        </div>

        <div className="flex gap-1.5">
          {model.showFours || model.showSixes ? <MiniStat label="4s / 6s" value={boundariesValue ?? '0 / 0'} /> : null}
          {model.showStrikeRate ? <MiniStat label="SR" value={model.batter.strikeRate} /> : null}
          <MiniStat label="P'ship" value={partnershipValue ?? '0(0)'} />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="secondary"
          className="border-danger/50 text-danger-soft gap-1.5"
          disabled={undoing}
          loading={undoing}
          onClick={onUndo}
        >
          <UndoIcon size="xs" className="h-3.5 w-3.5" strokeWidth={2} />
          Undo
        </Button>
        <Button variant="positive" disabled={undoing} onClick={onProceed}>
          Proceed
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
