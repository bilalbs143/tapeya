import { useMemo } from 'react';

import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetEnumsQuery } from '@/store/api/enumApi';

import { EndEventDialog } from './EndEventDialog';

/**
 * Manual end / cancel match (Action menu → Cancel Match).
 *
 * @param {string}   matchId
 * @param {Function} [onEnded] Called after the match is ended successfully
 */
export function EndMatchDialog({ matchId, onEnded }) {
  const toast = useToast();
  const { data: enums } = useGetEnumsQuery();
  const { endMatch } = useMatchAdmin({ matchId });

  const reasonOptions = useMemo(() => enums?.match_end_reason ?? [], [enums?.match_end_reason]);

  const handleSubmit = async (reason, comments, pointsEach) => {
    try {
      await endMatch({
        cancel_reason: reason,
        cancel_comments: comments,
        cancel_points_awarded_each: pointsEach,
      });
      toast.success('Match ended.');
      onEnded?.();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Could not end match. Please try again.'));
    }
  };

  return (
    <EndEventDialog
      title="End Match"
      reasonLabel="Select Reason for End Match"
      reasonAriaLabel="End Match Reason"
      commentsId="end-match-comments"
      reasonOptions={reasonOptions}
      onSubmit={handleSubmit}
    />
  );
}

export default EndMatchDialog;
