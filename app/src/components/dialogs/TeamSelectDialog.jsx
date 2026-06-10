import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Selecting a team calls onSelect and closes immediately.
 */
export function TeamSelectDialog({ title, teams, selectedTeamId, onSelect }) {
  const { closeDialog } = useDialog();
  const selected = selectedTeamId != null ? String(selectedTeamId) : '';

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact" className="pt-2">
          {teams.map((team) => {
            const id = String(team.id);
            const isSelected = selected === id;
            const name = team.name ?? `Team ${team.id}`;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  onSelect?.(id);
                  closeDialog();
                }}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[14px] font-medium transition-colors focus:outline-none ${
                  isSelected ? 'bg-brand text-ink' : 'bg-surface text-white'
                }`}
              >
                <TeamLogo team={team} variant="dialogSelect" />
                {name}
              </button>
            );
          })}
        </FormStack>
      </DialogScrollBody>
    </>
  );
}

export default TeamSelectDialog;
