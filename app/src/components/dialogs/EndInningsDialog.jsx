import { useMemo } from 'react';

import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetEnumsQuery } from '@/store/api/enumApi';

import { EndEventDialog } from './EndEventDialog';

/**
 * Manual end innings (Action menu → End Innings).
 *
 * @param {string} matchId
 * @param {string|number} inningsId
 */
export function EndInningsDialog({ matchId, inningsId }) {
  const toast = useToast();
  const { data: enums } = useGetEnumsQuery();
  const { endInnings } = useMatchAdmin({ matchId, inningsId });

  const reasonOptions = useMemo(() => enums?.innings_end_reason ?? [], [enums?.innings_end_reason]);

  const handleSubmit = async (reason, comments, pointsEach) => {
    try {
      await endInnings({
        end_reason: reason,
        end_comments: comments,
        points_awarded_each: pointsEach,
      });
      toast.success('Innings ended.');
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Could not end innings. Please try again.'));
    }
  };

  return (
    <EndEventDialog
      title="End Innings"
      reasonLabel="Select Reason for End Innings"
      reasonAriaLabel="End Innings Reason"
      commentsId="end-innings-comments"
      reasonOptions={reasonOptions}
      onSubmit={handleSubmit}
    />
  );
}

export default EndInningsDialog;
