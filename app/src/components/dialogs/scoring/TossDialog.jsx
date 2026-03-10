import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import { DialogTitle } from '@/ui/Dialog';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Toss dialog for Start Match – who won the toss and chose to bat/bowl.
 * Used with open/onOpenChange like other scoring dialogs.
 */
export function TossDialog({
  open,
  onOpenChange,
  teamAName,
  teamBName,
  tossWinner,
  setTossWinner,
  tossDecision,
  setTossDecision,
  onStartScoring,
  disabled,
  canConfirm = true,
}) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <DialogTitle className="text-[14px] !font-bold tracking-wide text-[#DA9811] uppercase">
          Who Won the Toss?
        </DialogTitle>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setTossWinner('A')}
            className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
              tossWinner === 'A'
                ? 'border-[#DA9811] bg-[#DA9811] text-white'
                : 'border-[#141412] bg-[#141412] text-white'
            }`}
          >
            <img
              src={teamMatchIcon}
              alt=""
              className="h-8 w-8 shrink-0"
              aria-hidden
            />
            <span className="text-[14px] font-bold uppercase">
              {teamAName || 'Team A'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTossWinner('B')}
            className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
              tossWinner === 'B'
                ? 'border-[#DA9811] bg-[#DA9811] text-white'
                : 'border-[#141412] bg-[#141412] text-white'
            }`}
          >
            <img
              src={teamMatchIcon}
              alt=""
              className="h-8 w-8 shrink-0"
              aria-hidden
            />
            <span className="text-[14px] font-bold uppercase">
              {teamBName || 'Team B'}
            </span>
          </button>
        </div>

        <p className="mt-6 text-[14px] font-medium text-white">Decided To?</p>
        <ToggleGroup
          type="single"
          value={tossDecision}
          onValueChange={(v) => v && setTossDecision(v)}
          className="mt-2 flex cursor-pointer gap-2"
        >
          <ToggleGroupItem
            value="bat"
            className="cursor-pointer"
            aria-label="Bat"
          >
            Bat
          </ToggleGroupItem>
          <ToggleGroupItem
            value="bowl"
            className="cursor-pointer"
            aria-label="Bowl"
          >
            Bowl
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="mt-6">
          <Button
            type="button"
            variant="orange"
            className="w-full cursor-pointer"
            onClick={onStartScoring}
            disabled={disabled || !canConfirm}
          >
            {disabled ? 'Creating…' : 'Start Scoring'}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

export default TossDialog;
