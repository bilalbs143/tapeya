import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/store/hooks';
import { closeDialog } from '@/store/slices/commonSlice';
import { Button } from '@/ui/Button';
import { DialogClose, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

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
 * Match over + `tournamentId`: **Continue** goes to that tournament’s fixtures tab.
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
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span aria-hidden className="w-5" />
        <DialogClose
          className="rounded p-1 text-white/60 ring-0 transition-colors outline-none hover:text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
          </svg>
        </DialogClose>
      </div>

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
            <p className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">
              Match result
            </p>
            <DialogTitle className="mt-3 text-[14px] font-bold text-white capitalize">
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

      <div className="shrink-0 px-5 pt-2 pb-5">
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
