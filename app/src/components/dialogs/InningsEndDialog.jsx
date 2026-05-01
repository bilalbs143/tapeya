import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/store/hooks';
import { closeDialog } from '@/store/slices/commonSlice';
import { Button } from '@/ui/Button';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

function reasonDescription({ reason, matchOvers, battingTeamName }) {
  if (reason === 'target') {
    return 'The target score has been reached.';
  }
  if (reason === 'wickets') {
    return 'All wickets have fallen for this innings.';
  }
  if (matchOvers != null && Number.isFinite(matchOvers)) {
    return `All ${matchOvers} overs have been completed${
      battingTeamName ? ` for ${battingTeamName}` : ''
    }.`;
  }
  return 'All scheduled overs for this innings have been completed.';
}

/**
 * Shown when live scoring detects the end of an innings (overs, wickets, or chase).
 * Match over + `tournamentId`: **Continue** goes to that tournament's fixtures tab.
 *
 * @param {object} [matchResult] – Second innings only: `{ tie, titleLine, marginLine?, scoresLine?, detailLine? }`.
 */
export function InningsEndDialog({
  variant = 'first_innings_break',
  reason = 'overs',
  battingTeamName = '',
  matchOvers,
  matchResult,
  tournamentId,
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isMatchOver = variant === 'match_over';

  const handleContinue = () => {
    if (isMatchOver && tournamentId != null && tournamentId !== '') {
      navigate(`/upcoming-tournaments/${tournamentId}?tab=fixtures`, {
        replace: true,
      });
    }
    dispatch(closeDialog());
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow hideClose reserveCloseSpace>
        <DialogTitle className={dialogPrimaryTitleClass}>
          {isMatchOver ? 'Match Over' : 'Innings Complete'}
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex min-h-0 flex-1 flex-col px-5 pb-4 text-center">
        {isMatchOver && matchResult ? (
          <>
            <p className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">
              Match result
            </p>
            <DialogTitle className="mt-3 text-[16px] leading-snug font-bold text-white capitalize">
              {matchResult.tie
                ? matchResult.titleLine
                : `${matchResult.titleLine} ${matchResult.marginLine ?? ''}`.trim()}
            </DialogTitle>
            {!matchResult.tie && matchResult.scoresLine ? (
              <p className="mt-3 text-[13px] leading-snug text-[#A2A6AB]">
                {matchResult.scoresLine}
              </p>
            ) : null}
            {matchResult.tie && matchResult.detailLine ? (
              <p className="mt-3 text-[13px] leading-snug text-[#A2A6AB]">
                {matchResult.detailLine}
              </p>
            ) : null}
          </>
        ) : isMatchOver ? (
          <>
            <DialogTitle className="text-[14px] font-bold text-white capitalize">
              Match ended
            </DialogTitle>
            <p className="mt-2 text-[13px] leading-snug text-[#A2A6AB]">
              {reasonDescription({ reason, matchOvers, battingTeamName })}
            </p>
          </>
        ) : (
          <>
            <DialogTitle className="text-[14px] font-bold text-white capitalize">
              Innings ended
            </DialogTitle>
            <p className="mt-2 text-[13px] leading-snug text-[#A2A6AB]">
              The first innings is complete. Continue when you are ready to set
              up the second innings.
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[#A2A6AB]">
              {reasonDescription({ reason, matchOvers, battingTeamName })}
            </p>
          </>
        )}
      </DialogScrollBody>

      <div className="shrink-0 px-5 pt-4 pb-5">
        <Button
          type="button"
          variant="orangeDialog"
          size="dialog"
          className="w-full"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default InningsEndDialog;
