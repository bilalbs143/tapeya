import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

function reasonDescription({ reason, matchOvers, battingTeamName }) {
  if (reason === 'target_reached' || reason === 'target') {
    return 'The target score has been reached.';
  }
  if (reason === 'all_out' || reason === 'wickets') {
    return 'All wickets have fallen for this innings.';
  }
  // overs_complete or any fallback
  if (matchOvers != null && Number.isFinite(matchOvers)) {
    return `All ${matchOvers} overs have been completed${battingTeamName ? ` for ${battingTeamName}` : ''}.`;
  }
  return 'All scheduled overs for this innings have been completed.';
}

/**
 * Shown when live scoring detects the end of an innings (overs, wickets, or chase).
 * Man of the Match is handled by {@link ManOfTheMatchDialog} when opened from the parent.
 *
 * @param {object} [matchResult] – Second innings only: summary + `tie`, `winningTeamId`, lines.
 */
export function InningsEndDialog({
  variant = 'first_innings_break',
  reason = 'overs',
  battingTeamName = '',
  matchOvers,
  matchResult,
}) {
  const { closeDialog } = useDialog();
  const isMatchOver = variant === 'match_over';

  const handleContinue = () => {
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{isMatchOver ? 'Match Over' : 'Innings Complete'}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col text-center">
        {isMatchOver && matchResult ? (
          <>
            <p className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">Match result</p>
            <DialogTitle className="mt-3 text-[16px] leading-snug font-bold text-white capitalize">
              {matchResult.tie ? matchResult.titleLine : `${matchResult.titleLine} ${matchResult.marginLine ?? ''}`.trim()}
            </DialogTitle>
            {!matchResult.tie && matchResult.scoresLine ? (
              <p className="mt-3 text-[13px] leading-snug text-[#A2A6AB]">{matchResult.scoresLine}</p>
            ) : null}
            {matchResult.tie && matchResult.detailLine ? (
              <p className="mt-3 text-[13px] leading-snug text-[#A2A6AB]">{matchResult.detailLine}</p>
            ) : null}
          </>
        ) : isMatchOver ? (
          <>
            <DialogTitle className="text-[14px] font-bold text-white">Match Ended</DialogTitle>
            <p className="mt-2 text-[13px] leading-snug text-[#A2A6AB]">
              {reasonDescription({ reason, matchOvers, battingTeamName })}
            </p>
          </>
        ) : (
          <>
            <DialogTitle className="text-[14px] font-bold text-white">Innings Ended</DialogTitle>
            <p className="mt-2 text-[13px] leading-snug text-[#A2A6AB]">
              The first innings is complete. Continue when you are ready to set up the second innings.
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[#A2A6AB]">
              {reasonDescription({ reason, matchOvers, battingTeamName })}
            </p>
          </>
        )}
      </DialogScrollBody>

      <DialogSaveButton onClick={handleContinue}>Continue</DialogSaveButton>
    </>
  );
}

export default InningsEndDialog;
