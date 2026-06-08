import { useCallback } from 'react';

import {
  useCreateMatchNoteMutation,
  useDeclareResultMutation,
  useDeleteMatchNoteMutation,
  useEndInningsMutation,
  useEndMatchMutation,
  useReviseTargetMutation,
  useStoreMatchBreakMutation,
} from '@/store/api/matchApi';

/**
 * Match administration mutations (manual end innings, declare result, etc.).
 *
 * @param {object} params
 * @param {string} params.matchId
 * @param {string|number|null} [params.inningsId] Active innings id for innings-scoped actions
 */
export function useMatchAdmin({ matchId, inningsId } = {}) {
  const [endInningsMutation, { isLoading: isEndingInnings }] = useEndInningsMutation();
  const [endMatchMutation, { isLoading: isEndingMatch }] = useEndMatchMutation();
  const [declareResultMutation, { isLoading: isDeclaringResult }] = useDeclareResultMutation();
  const [reviseTargetMutation, { isLoading: isRevisingTarget }] = useReviseTargetMutation();
  const [storeBreakMutation, { isLoading: isStoringBreak }] = useStoreMatchBreakMutation();
  const [createNoteMutation, { isLoading: isCreatingNote }] = useCreateMatchNoteMutation();
  const [deleteNoteMutation, { isLoading: isDeletingNote }] = useDeleteMatchNoteMutation();

  const endInnings = useCallback(
    async ({ end_reason, end_comments, points_awarded_each }) => {
      if (!matchId || inningsId == null) {
        throw new Error('Match and innings are required to end an innings.');
      }
      return endInningsMutation({
        matchId,
        inningsId,
        end_reason,
        end_comments,
        points_awarded_each,
      }).unwrap();
    },
    [matchId, inningsId, endInningsMutation],
  );

  const endMatch = useCallback(
    async ({ cancel_reason, cancel_comments, cancel_points_awarded_each }) => {
      if (!matchId) {
        throw new Error('Match is required to end a match.');
      }
      return endMatchMutation({
        matchId,
        cancel_reason,
        cancel_comments,
        cancel_points_awarded_each,
      }).unwrap();
    },
    [matchId, endMatchMutation],
  );

  const declareResult = useCallback(
    async ({ declare_result_type, winner_team_id, declare_result_note }) => {
      if (!matchId) {
        throw new Error('Match is required to declare a result.');
      }
      return declareResultMutation({
        matchId,
        declare_result_type,
        winner_team_id,
        declare_result_note,
      }).unwrap();
    },
    [matchId, declareResultMutation],
  );

  const reviseTarget = useCallback(
    async ({ revised_target, action }) => {
      if (!matchId) {
        throw new Error('Match is required to revise the target.');
      }
      return reviseTargetMutation({ matchId, revised_target, action }).unwrap();
    },
    [matchId, reviseTargetMutation],
  );

  const storeBreak = useCallback(
    async ({ break_type, notes, innings_id }) => {
      if (!matchId) throw new Error('Match is required to record a break.');
      return storeBreakMutation({ matchId, break_type, notes, innings_id }).unwrap();
    },
    [matchId, storeBreakMutation],
  );

  const createNote = useCallback(
    async ({ body }) => {
      if (!matchId) throw new Error('Match is required to create a note.');
      return createNoteMutation({ matchId, body }).unwrap();
    },
    [matchId, createNoteMutation],
  );

  const deleteNote = useCallback(
    async ({ noteId }) => {
      if (!matchId) throw new Error('Match is required to delete a note.');
      return deleteNoteMutation({ matchId, noteId }).unwrap();
    },
    [matchId, deleteNoteMutation],
  );

  return {
    endInnings,
    isEndingInnings,
    endMatch,
    isEndingMatch,
    declareResult,
    isDeclaringResult,
    reviseTarget,
    isRevisingTarget,
    storeBreak,
    isStoringBreak,
    createNote,
    isCreatingNote,
    deleteNote,
    isDeletingNote,
  };
}
