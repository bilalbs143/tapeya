import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import { DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export function AddBatsmanDialog({
  open,
  onOpenChange,
  players,
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  isApiMatch,
  hideSquadSetup = false,
  savingBatsmanSquad,
  requiredBatting,
  currentSquad,
  onSaveSquad,
  onAddBatsmanToCrease,
  onSetBatsmanRole,
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
          Select Batsman
        </DialogTitle>
      </div>
      <DialogScrollBody className="flex flex-col gap-3">
        {players.map((b) => {
          const hasBattingStats = isPlayerBattingOrOut(b.id);
          const canAdd =
            !hasBattingStats &&
            (hideSquadSetup || b.role === 'playing') &&
            canAddMoreBatsmen;
          const stats = getBatsmanDisplayStats(b.id);
          return (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              onClick={() => canAdd && onAddBatsmanToCrease(b)}
              onKeyDown={(e) => {
                if (canAdd && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onAddBatsmanToCrease(b);
                }
              }}
              className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${
                canAdd
                  ? 'cursor-pointer transition-opacity active:opacity-90'
                  : ''
              } ${hasBattingStats ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-bold text-white">
                  {b.name}
                </span>
                {hasBattingStats && stats ? (
                  <div className="flex shrink-0 gap-4 text-[12px] text-[#A2A6AB]">
                    <span>R: {stats.runs}</span>
                    <span>B: {stats.balls}</span>
                    <span>4s: {stats.fours}</span>
                    <span>6s: {stats.sixes}</span>
                    <span>SR: {stats.strikeRate}</span>
                  </div>
                ) : hideSquadSetup ? null : (
                  <div
                    className="flex shrink-0 gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={b.role === 'playing' ? 'orange' : 'black'}
                      onClick={() => onSetBatsmanRole(b.id, 'playing')}
                      className="text-[12px] font-bold uppercase"
                    >
                      Playing
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={b.role === 'bench' ? 'orange' : 'black'}
                      onClick={() => onSetBatsmanRole(b.id, 'bench')}
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
              savingBatsmanSquad ||
              currentSquad.filter((p) => p.role === 'playing').length !==
                requiredBatting
            }
            onClick={onSaveSquad}
          >
            {savingBatsmanSquad ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </BaseDialog>
  );
}

export default AddBatsmanDialog;
