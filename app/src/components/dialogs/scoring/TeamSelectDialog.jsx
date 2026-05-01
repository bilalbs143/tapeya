import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

/**
 * Dialog to pick a team from a list (Start Match – tournament flow).
 * Shows list of teams; selecting one calls onSelect and closes.
 * Done button closes without changing selection.
 */
export function TeamSelectDialog({
  open,
  onOpenChange,
  title,
  teams,
  selectedTeamId,
  onSelect,
}) {
  const selected = selectedTeamId != null ? String(selectedTeamId) : '';

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col">
        <DialogHeaderRow hideClose>
          <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
        </DialogHeaderRow>

        <DialogScrollBody className="flex flex-col gap-2 px-5 pt-2">
          {teams.map((team) => {
            const id = String(team.id);
            const isSelected = selected === id;
            const name = team.name ?? `Team ${team.id}`;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  onSelect(id);
                  onOpenChange(false);
                }}
                className={`flex w-full cursor-pointer items-center rounded-full px-4 py-3 text-left text-[14px] font-medium transition-colors focus:outline-none ${
                  isSelected
                    ? 'bg-[#DA9811] text-[#080807]'
                    : 'bg-[#141412] text-white'
                }`}
              >
                {name}
              </button>
            );
          })}
        </DialogScrollBody>

        <div className="shrink-0 px-5 pt-4 pb-5">
          <Button
            type="button"
            variant="orange"
            className="w-full cursor-pointer !bg-[#DA9811] !text-[#080807]"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

export default TeamSelectDialog;
