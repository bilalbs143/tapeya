import { useState } from 'react';

import declareAwardIconUrl from '@/assets/images/icons/declare-award.svg';
import declareDrawIconUrl from '@/assets/images/icons/declare-draw.svg';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CdnIcon } from '@/ui/CdnIcon';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
import { Textarea } from '@/ui/Textarea';

const PROCEED_BUTTON_BASE =
  'flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const proceedButtonClass = (active) =>
  `${PROCEED_BUTTON_BASE} ${active ? 'border-brand bg-surface-raised text-brand' : 'border-border-subtle bg-surface text-white'}`;

const TEAM_CARD_BASE =
  'flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const teamCardClass = (selected) =>
  `${TEAM_CARD_BASE} ${selected ? 'border-brand bg-surface-raised text-brand' : 'border-border-subtle bg-surface text-white'}`;

/**
 * Declare match result — Award (pick winner + note) or Draw.
 *
 * @param {string} matchId
 * @param {string} teamAName
 * @param {string} teamBName
 * @param {string|null} [teamALogo]
 * @param {string|null} [teamBLogo]
 * @param {number} homeTeamId
 * @param {number} awayTeamId
 * @param {() => void} [onDeclared] After successful declare (e.g. match-over flow)
 */
export function DeclareResultDialog({ matchId, teamAName, teamBName, teamALogo, teamBLogo, homeTeamId, awayTeamId, onDeclared }) {
  const { closeDialog } = useDialog();
  const toast = useToast();
  const { declareResult, isDeclaringResult } = useMatchAdmin({ matchId });

  const [proceedType, setProceedType] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [note, setNote] = useState('');

  const isAward = proceedType === 'award';
  const isDraw = proceedType === 'draw';
  const canApply = (isDraw || (isAward && winnerTeamId !== '')) && !isDeclaringResult;

  const handleApply = async () => {
    if (!canApply) return;
    try {
      await declareResult({
        declare_result_type: proceedType,
        winner_team_id: isAward ? Number(winnerTeamId) : null,
        declare_result_note: note.trim() || null,
      });
      closeDialog();
      toast.success('Result declared.');
      onDeclared?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not declare result. Please try again.'));
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Declare Result</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="How You Want to Proceed" controlOffset="md">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProceedType('award')}
                className={proceedButtonClass(isAward)}
                aria-pressed={isAward}
              >
                <CdnIcon src={declareAwardIconUrl} className="h-7 w-7" />
                <span className="text-[13px] font-bold uppercase">Award</span>
              </button>
              <button
                type="button"
                onClick={() => setProceedType('draw')}
                className={proceedButtonClass(isDraw)}
                aria-pressed={isDraw}
              >
                <CdnIcon src={declareDrawIconUrl} className="h-7 w-7" />
                <span className="text-[13px] font-bold uppercase">Draw</span>
              </button>
            </div>
          </DialogFormSection>

          {isDraw && (
            <p className="border-border-subtle bg-surface text-muted rounded-lg border px-3 py-2.5 text-[12px] leading-snug">
              This will declare the match a <span className="font-semibold text-white">draw</span>. This action cannot be undone.
            </p>
          )}

          {isAward ? (
            <>
              <DialogFormSection label="Choose Winner Team" controlOffset="md">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWinnerTeamId(String(homeTeamId))}
                    className={teamCardClass(winnerTeamId === String(homeTeamId))}
                    aria-pressed={winnerTeamId === String(homeTeamId)}
                  >
                    <TeamLogo name={teamAName} logo={teamALogo} variant="dialog" />
                    <span className="text-center text-[12px] font-bold uppercase">{teamAName || 'Team A'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinnerTeamId(String(awayTeamId))}
                    className={teamCardClass(winnerTeamId === String(awayTeamId))}
                    aria-pressed={winnerTeamId === String(awayTeamId)}
                  >
                    <TeamLogo name={teamBName} logo={teamBLogo} variant="dialog" />
                    <span className="text-center text-[12px] font-bold uppercase">{teamBName || 'Team B'}</span>
                  </button>
                </div>
              </DialogFormSection>

              <DialogFormSection label="Note" controlOffset="sm">
                <Textarea
                  id="declare-result-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write Here..."
                  rows={3}
                  className="min-h-0 resize-none"
                />
              </DialogFormSection>
            </>
          ) : null}
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canApply} loading={isDeclaringResult} onClick={handleApply}>
        {isDeclaringResult ? 'Applying…' : 'Apply'}
      </DialogSaveButton>
    </>
  );
}

export default DeclareResultDialog;
