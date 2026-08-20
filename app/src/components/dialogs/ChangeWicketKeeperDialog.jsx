import { useEffect, useMemo, useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useChangeWicketKeeper } from '@/hooks/useChangeWicketKeeper';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { LoaderBlock } from '@/ui/Loader';

/**
 * Action menu → Change Wicket Keeper (bowling team playing XI).
 */
export function ChangeWicketKeeperDialog({ matchId, teamId, players = [] }) {
  const { closeDialog } = useDialog();
  const toast = useToast();

  const { squad, isLoadingSquad, updateWicketKeeper, isSaving } = useChangeWicketKeeper({ matchId, teamId });

  const sortedPlayers = useMemo(
    () =>
      [...players]
        .filter((p) => p?.id != null)
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })),
    [players],
  );

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (squad?.wicket_keeper_id != null) {
      setSelectedId(String(squad.wicket_keeper_id));
    }
  }, [squad?.wicket_keeper_id]);

  const canSubmit = selectedId != null && !isSaving && !isLoadingSquad;

  const handleDone = async () => {
    if (!canSubmit) return;
    try {
      await updateWicketKeeper({ wicket_keeper_id: selectedId });
      toast.success('Wicket keeper updated.');
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update wicket keeper. Please try again.'));
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Change Wicket Keeper</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          {isLoadingSquad && <LoaderBlock label="Loading squad" className="py-6" />}
          {!isLoadingSquad && (
            <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Wicket Keeper">
              {sortedPlayers.length === 0 && <li className="text-muted text-[13px]">No players found in squad.</li>}
              {sortedPlayers.map((player) => {
                const id = String(player.id);
                const selected = selectedId === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSelectedId(id)}
                      className={`focus-visible:ring-brand flex w-full items-center gap-3 rounded-[10px] border-2 px-4 py-3 text-left text-[13px] text-white transition-colors focus:outline-none focus-visible:ring-2 ${
                        selected ? 'border-brand bg-surface-raised' : 'bg-surface border-[#141412]'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-brand' : 'border-[#A2A6AB]'
                        }`}
                        aria-hidden
                      >
                        {selected ? <span className="bg-brand h-2 w-2 rounded-full" /> : null}
                      </span>
                      {player.name ?? `Player ${id}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} loading={isSaving} onClick={handleDone}>
        {isSaving ? 'Saving…' : 'Done'}
      </DialogSaveButton>
    </>
  );
}

export default ChangeWicketKeeperDialog;
