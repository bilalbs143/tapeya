import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import {
  Dialog,
  DialogContentDark,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

export function FielderPickerDialog({
  open,
  onOpenChange,
  message,
  players,
  onSelectFielder,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentDark className="!h-auto !max-h-[90vh]">
        <DialogHeaderRow>
          <DialogTitle className={dialogPrimaryTitleClass}>
            {message?.trim() ? message : 'Choose fielder'}
          </DialogTitle>
        </DialogHeaderRow>
        <DialogScrollBody className="px-5 pb-4">
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => onSelectFielder(player.id)}
                className="cursor-pointer rounded-[6px] bg-black px-4 py-3 text-left transition-opacity hover:bg-[#1a1a18] active:opacity-90"
              >
                <span className="block text-[14px] font-medium text-white">
                  {player.name}
                </span>
                <ScoringPlayerPickerMeta player={player} variant="fielder" />
              </button>
            ))}
          </div>
        </DialogScrollBody>
      </DialogContentDark>
    </Dialog>
  );
}

export default FielderPickerDialog;
