import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import { FORM_FIELD_ERROR_CLASS } from '@/lib/constants/formLayout';
import { useUpdatePlayerOfMatchMutation } from '@/store/api/matchApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';

function finishNavigateAndClose({ closeDialog, navigate, tournamentId }) {
  if (tournamentId != null && tournamentId !== '') {
    navigate(`/upcoming-tournaments/${tournamentId}?tab=fixtures`, {
      replace: true,
    });
  }
  closeDialog();
}

/**
 * Stand-alone dialog: pick Man of the Match after the match ends.
 */
export function ManOfTheMatchDialog({ matchId, tournamentId, manOfMatchPickerUsesBothTeams = true, manOfMatchCandidates = [] }) {
  const { closeDialog } = useDialog();
  const navigate = useNavigate();
  const [updatePlayerOfMatch, { isLoading: isSavingMotm }] = useUpdatePlayerOfMatchMutation();

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setSelectedPlayerId(null);
    setSaveError(null);
  }, [matchId]);

  const motmSubtitle = manOfMatchPickerUsesBothTeams
    ? 'No single winner — pick from either team’s playing eleven.'
    : 'Choose one player from the winning team.';

  const handleSaveMotm = async () => {
    if (!matchId || selectedPlayerId == null) return;
    setSaveError(null);
    try {
      await updatePlayerOfMatch({
        matchId,
        player_of_match_user_id: selectedPlayerId,
      }).unwrap();
    } catch {
      setSaveError('Could not save. The match may still be syncing — try again in a moment.');
      return;
    }
    finishNavigateAndClose({ closeDialog, navigate, tournamentId });
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Man of the Match</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact" className="text-center">
          <p className="text-muted text-[13px] leading-snug">{motmSubtitle}</p>
          {saveError ? (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {saveError}
            </p>
          ) : null}
          {manOfMatchCandidates.length === 0 ? (
            <p className="text-muted text-[13px] leading-snug">
              No playing eleven found for this match. You can set man of the match later from match details if needed.
            </p>
          ) : (
            <ul className="flex max-h-[min(52vh,360px)] flex-col gap-2 overflow-y-auto text-left">
              {manOfMatchCandidates.map((p) => {
                const picked = selectedPlayerId === p.id;
                return (
                  <li key={`motm-${p.id}`}>
                    <button
                      type="button"
                      aria-pressed={picked}
                      onClick={() => {
                        setSelectedPlayerId(p.id);
                        setSaveError(null);
                      }}
                      className={`w-full rounded-[14px] border-2 px-4 py-3 text-left text-[14px] font-medium transition-colors focus:outline-none ${
                        picked ? 'border-brand bg-surface-elevated text-white' : 'bg-surface border-[#141412] text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton
        disabled={isSavingMotm || manOfMatchCandidates.length === 0 || selectedPlayerId == null}
        onClick={handleSaveMotm}
      >
        {isSavingMotm ? 'Saving…' : 'Save'}
      </DialogSaveButton>
    </>
  );
}

export default ManOfTheMatchDialog;
