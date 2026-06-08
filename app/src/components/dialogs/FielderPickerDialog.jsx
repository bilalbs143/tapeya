import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export function FielderPickerDialog({ message, players = [], onSelectFielder }) {
  const { closeDialog } = useDialog();
  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{message?.trim() ? message : 'Choose Fielder'}</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody>
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                onSelectFielder?.(player.id);
                closeDialog();
              }}
              className="bg-surface hover:bg-surface-elevated cursor-pointer rounded-[6px] px-4 py-3 text-left transition-opacity active:opacity-90"
            >
              <span className="block text-[14px] font-medium text-white">{player.name}</span>
              <ScoringPlayerPickerMeta player={player} variant="fielder" />
            </button>
          ))}
        </div>
      </DialogScrollBody>
    </>
  );
}

export default FielderPickerDialog;
