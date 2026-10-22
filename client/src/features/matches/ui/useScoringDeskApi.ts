import { useNoBallOptions } from '@/shared/api/enumsApi';

import {
  useDeclareResultMutation,
  useDeleteBallMutation,
  useDeleteLastBallMutation,
  useEndInningsMutation,
  useEndMatchMutation,
  useGetMatchResultQuery,
  useGetScorecardQuery,
  useGetScoringFixtureQuery,
  useGetScoringStateQuery,
  useReviseTargetMutation,
  useStoreBallMutation,
  useUpdateBallMutation,
  useUpdateCreaseMutation,
} from '../api/matchesApi';

/** RTK queries + mutations + no-ball enums for the scoring desk. */
export function useScoringDeskApi(matchId: number) {
  const fixtureQuery = useGetScoringFixtureQuery(matchId);
  const stateQuery = useGetScoringStateQuery(matchId);
  const scorecardQuery = useGetScorecardQuery(matchId);
  const resultQuery = useGetMatchResultQuery(matchId);

  const [storeBall, storeState] = useStoreBallMutation();
  const [updateBall, updateBallState] = useUpdateBallMutation();
  const [deleteBall, deleteBallState] = useDeleteBallMutation();
  const [deleteLastBall, undoState] = useDeleteLastBallMutation();
  const [updateCrease, creaseState] = useUpdateCreaseMutation();
  const [reviseTarget, reviseTargetState] = useReviseTargetMutation();
  const [endInnings, endInningsState] = useEndInningsMutation();
  const [endMatch, endMatchState] = useEndMatchMutation();
  const [declareResult, declareResultState] = useDeclareResultMutation();
  const { typeOptions: noBallTypes, runsTypeOptions: noBallRunsTypes } = useNoBallOptions();

  return {
    fixtureQuery,
    stateQuery,
    scorecardQuery,
    resultQuery,
    storeBall,
    storeState,
    updateBall,
    updateBallState,
    deleteBall,
    deleteBallState,
    deleteLastBall,
    undoState,
    updateCrease,
    creaseState,
    reviseTarget,
    reviseTargetState,
    endInnings,
    endInningsState,
    endMatch,
    endMatchState,
    declareResult,
    declareResultState,
    noBallTypes,
    noBallRunsTypes,
    saving: storeState.isLoading || undoState.isLoading,
  };
}
