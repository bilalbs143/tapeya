import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';

function TeamCard({ name, label, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="bg-surface hover:border-brand focus-visible:ring-brand flex w-full flex-col items-start gap-1 rounded-[10px] border-2 border-[#141412] px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2"
    >
      <span className="text-muted text-[11px] font-medium tracking-wide uppercase">{label}</span>
      <span className="text-[14px] font-semibold text-white">{name}</span>
    </button>
  );
}

/**
 * Action menu → Change Squad — pick batting or bowling team, then open squad editor.
 *
 * @param {string} battingTeamName
 * @param {string} bowlingTeamName
 * @param {(team: 'batting'|'bowling') => void} onSelectTeam
 */
export function ChangeSquadDialog({ battingTeamName, bowlingTeamName, onSelectTeam }) {
  const { closeDialog } = useDialog();

  const handleSelect = (team) => {
    closeDialog();
    onSelectTeam?.(team);
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Change Squad</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <p className="text-muted text-[13px]">Choose which team&apos;s squad to update.</p>
          <TeamCard name={battingTeamName || 'Batting Team'} label="Batting Team" onSelect={() => handleSelect('batting')} />
          <TeamCard name={bowlingTeamName || 'Bowling Team'} label="Bowling Team" onSelect={() => handleSelect('bowling')} />
        </FormStack>
      </DialogScrollBody>
    </>
  );
}

export default ChangeSquadDialog;
