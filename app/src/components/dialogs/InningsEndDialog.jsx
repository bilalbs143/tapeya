import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useUpdatePlayerOfMatchMutation } from '@/store/api/matchApi';
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

function finishAndNavigate({
  dispatch,
  navigate,
  isMatchOver,
  tournamentId,
}) {
  if (isMatchOver && tournamentId != null && tournamentId !== '') {
    navigate(`/upcoming-tournaments/${tournamentId}?tab=fixtures`, {
      replace: true,
    });
  }
  dispatch(closeDialog());
}

/**
 * Shown when live scoring detects the end of an innings (overs, wickets, or chase).
 * After the second innings, optionally records Man of the Match before closing.
 *
 * @param {object} [matchResult] – Second innings only: summary + `tie`, `winningTeamId`, lines.
 * @param {object[]} [manOfMatchCandidates] – `{ id, name, teamId }[]` from playing elevens.
 * @param {boolean} [manOfMatchPickerUsesBothTeams] – True when the candidate list includes both teams (tie / no winner / fallback).
 */
export function InningsEndDialog({
  variant = 'first_innings_break',
  reason = 'overs',
  battingTeamName = '',
  matchOvers,
  matchResult,
  tournamentId,
  matchId,
  playerOfMatchAlreadySet = false,
  manOfMatchPickerUsesBothTeams = true,
  manOfMatchCandidates = [],
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [updatePlayerOfMatch, { isLoading: isSavingMotm }] =
    useUpdatePlayerOfMatchMutation();

  const isMatchOver = variant === 'match_over';
  const showMotmStep = isMatchOver && !playerOfMatchAlreadySet;

  const [step, setStep] = useState('result');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setStep('result');
    setSelectedPlayerId(null);
    setSaveError(null);
  }, [matchId, variant]);

  const motmSubtitle = manOfMatchPickerUsesBothTeams
    ? 'No single winner — pick from either team’s playing eleven, or skip.'
    : 'Choose one player from the winning team’s playing eleven.';

  const handleContinueFromResult = () => {
    if (showMotmStep && manOfMatchCandidates.length > 0) {
      setStep('motm');
      return;
    }
    finishAndNavigate({ dispatch, navigate, isMatchOver, tournamentId });
  };

  const handleSkipMotm = () => {
    finishAndNavigate({ dispatch, navigate, isMatchOver, tournamentId });
  };

  const handleSaveMotm = async () => {
    if (!matchId || selectedPlayerId == null) return;
    setSaveError(null);
    try {
      await updatePlayerOfMatch({
        matchId,
        player_of_match_user_id: selectedPlayerId,
      }).unwrap();
    } catch {
      setSaveError(
        'Could not save. The match may still be syncing — try again in a moment.',
      );
      return;
    }
    finishAndNavigate({ dispatch, navigate, isMatchOver, tournamentId });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          {step === 'motm'
            ? 'Man of the match'
            : isMatchOver
              ? 'Match Over'
              : 'Innings Complete'}
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex min-h-0 flex-1 flex-col px-5 pb-4 text-center">
        {step === 'result' ? (
          <>
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
          </>
        ) : (
          <>
            <p className="text-[13px] leading-snug text-[#A2A6AB]">
              {motmSubtitle}
            </p>
            {saveError ? (
              <p
                className="mt-3 text-[13px] leading-snug text-red-400"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}
            {manOfMatchCandidates.length === 0 ? (
              <p className="mt-4 text-[13px] leading-snug text-[#A2A6AB]">
                No playing eleven found for this match. You can set man of the
                match later from match details if needed.
              </p>
            ) : (
              <ul className="mt-4 flex max-h-[min(52vh,360px)] flex-col gap-2 overflow-y-auto text-left">
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
                          picked
                            ? 'border-[#DA9811] bg-[#1a1a18] text-white'
                            : 'border-[#141412] bg-[#141412] text-white'
                        }`}
                      >
                        {p.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </DialogScrollBody>

      <div className="shrink-0 space-y-2 px-5 pt-4 pb-5">
        {step === 'result' ? (
          <Button
            type="button"
            variant="orangeDialog"
            size="dialog"
            className="w-full"
            onClick={handleContinueFromResult}
          >
            Continue
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="orangeDialog"
              size="dialog"
              className="w-full"
              disabled={
                isSavingMotm ||
                manOfMatchCandidates.length === 0 ||
                selectedPlayerId == null
              }
              onClick={handleSaveMotm}
            >
              {isSavingMotm ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="dark"
              size="dialog"
              className="w-full"
              disabled={isSavingMotm}
              onClick={handleSkipMotm}
            >
              Skip
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default InningsEndDialog;
