import { useWicketFlow } from '@/hooks/useWicketFlow';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';

import { DismissalChip } from './DismissalChip';
import { WicketSummaryCard } from './WicketSummaryCard';

/**
 * Post-wicket review bottom sheet.
 */
export function WicketSummaryScreen({ open, model, onUndo, onProceed, isUndoing = false }) {
  const { handleUndo, handleProceed } = useWicketFlow({ onUndo, onProceed });

  return (
    <BottomSheet
      key={model?.ballId ?? 'wicket'}
      open={open && Boolean(model)}
      onOpenChange={() => {}}
      title="Wicket"
      dismissible={false}
      showClose={false}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleUndo}
            disabled={isUndoing}
            className="border-border-subtle bg-surface flex flex-1 items-center justify-center rounded-lg border py-3.5 text-[14px] font-bold text-white transition-opacity active:opacity-80 disabled:opacity-50"
          >
            Undo
          </button>
          <Button
            type="button"
            variant="orange"
            onClick={handleProceed}
            disabled={isUndoing}
            className="flex-1 rounded-lg py-3.5 text-[14px]"
          >
            Proceed
          </Button>
        </div>
      }
    >
      {model ? (
        <>
          <div className="mb-4">
            <DismissalChip label={model.chipLabel} />
          </div>

          <section
            className="border-border-subtle bg-surface rounded-[17px] border px-5 py-5"
            aria-labelledby="wicket-summary-title"
          >
            <p id="wicket-summary-title" className="text-center text-[40px] leading-none font-bold text-white">
              {model.scoreDisplay}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#EF4444]" aria-hidden />
              <p className="text-muted text-[13px] font-medium">{model.oversDisplay} overs</p>
            </div>
          </section>

          <div className="mt-4">
            <WicketSummaryCard
              batter={model.batter}
              bowlerName={model.bowlerName}
              fielderName={model.fielderName}
              showBowler={model.showBowler}
              showFielder={model.showFielder}
              showCreaseTime={model.showCreaseTime}
              showFours={model.showFours}
              showSixes={model.showSixes}
              showStrikeRate={model.showStrikeRate}
            />
          </div>
        </>
      ) : null}
    </BottomSheet>
  );
}
