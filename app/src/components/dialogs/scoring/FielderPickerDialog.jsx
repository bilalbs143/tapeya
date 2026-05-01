import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import {
  Dialog,
  DialogContent,
  DialogHeaderRow,
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
      <DialogContent
        className="!max-h-[85vh] rounded-t-3xl !bg-[#141412] px-0 pb-8 pt-2"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {message?.trim() ? message : 'Choose fielder'}
        </DialogTitle>
        <DialogHeaderRow reserveCloseSpace={false} />
        <p className="mb-3 px-5 text-[12px] font-medium text-[#A2A6AB]">
          {message}
        </p>
        <DialogScrollBody className="max-h-[50vh] px-5">
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
      </DialogContent>
    </Dialog>
  );
}

export default FielderPickerDialog;
