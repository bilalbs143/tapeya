import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import { DialogScrollBody, DialogTitle } from '@/ui/Dialog';

import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';

export function AddBowlerDialog({
  open,
  onOpenChange,
  players,
  canAddMoreBowlers,
  bowlersInTable,
  isApiMatch,
  hideSquadSetup = false,
  savingBowlerSquad,
  requiredBowling,
  currentBowlerSquad,
  onSaveBowlerSquad,
  onSelectBowlerForNextOver,
  onSetBowlerRole,
}) {
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={handleOpenChange}>
      <div className="shrink-0 px-5 py-4">
        <DialogTitle className="text-[14px] !font-bold tracking-wide text-[#DA9811] uppercase">
          Select Bowler
        </DialogTitle>
      </div>
      <DialogScrollBody className="flex flex-col gap-3">
        {players.map((b) => {
          const inTable = bowlersInTable.some(
            (bt) => String(bt.id) === String(b.id),
          );
          const playingEligible = hideSquadSetup || b.role === 'playing';
          const canAdd = playingEligible && canAddMoreBowlers && !inTable;
          const canSwapIn = playingEligible && !inTable && !canAddMoreBowlers;
          const canSelect = inTable || canAdd || canSwapIn;
          return (
            <div
              key={b.id}
              role="button"
              tabIndex={canSelect ? 0 : -1}
              onClick={() => canSelect && onSelectBowlerForNextOver(b)}
              onKeyDown={(e) => {
                if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectBowlerForNextOver(b);
                }
              }}
              className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${
                canSelect
                  ? 'cursor-pointer transition-opacity active:opacity-90'
                  : 'cursor-default'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-white">
                    {b.name}
                  </span>
                  <ScoringPlayerPickerMeta player={b} variant="bowling" />
                </div>
                {hideSquadSetup ? null : (
                  <div
                    className="flex shrink-0 gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={b.role === 'playing' ? 'orange' : 'black'}
                      onClick={() => onSetBowlerRole(b.id, 'playing')}
                      className="text-[12px] font-bold uppercase"
                    >
                      Playing
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={b.role === 'bench' ? 'orange' : 'black'}
                      onClick={() => onSetBowlerRole(b.id, 'bench')}
                      className="text-[12px] font-bold uppercase"
                    >
                      Bench
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </DialogScrollBody>
      {isApiMatch && !hideSquadSetup && (
        <div className="shrink-0 px-5 pt-2 pb-5">
          <Button
            type="button"
            variant="orangeDialog"
            size="dialog"
            className="w-full"
            disabled={
              savingBowlerSquad ||
              currentBowlerSquad.filter((p) => p.role === 'playing').length !==
                requiredBowling
            }
            onClick={onSaveBowlerSquad}
          >
            {savingBowlerSquad ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </BaseDialog>
  );
}

export default AddBowlerDialog;
