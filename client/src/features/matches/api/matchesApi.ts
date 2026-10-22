/**
 * Matches RTK Query barrel — split by resource per Phase 1 Q2 / blueprint §5.4.
 * Import hooks / `matchesApi` from this module so call sites stay stable.
 */

/**
 * Prefer the scoring inject for `matchesApi.util` typing (channel patches `getScoringState`).
 * All resource modules inject into the same `baseApi` slice at runtime.
 */
import { matchScoringApi as matchesApi } from './matchScoringApi';

import './matchControlApi';
import './matchGraphicsApi';
import './matchListApi';
import './matchSquadApi';

export { matchesApi };
export type { MatchNoteRow } from './matchControlApi';
export {
  useCreateMatchNoteMutation,
  useDeclareResultMutation,
  useDeleteMatchNoteMutation,
  useEndInningsMutation,
  useEndMatchMutation,
  useGetMatchNotesQuery,
  useReviseTargetMutation,
  useStoreMatchBreakMutation,
  useStoreMatchSubstituteMutation,
  useUpdateMatchAnalyticsSettingsMutation,
} from './matchControlApi';
export {
  useGetGraphicSessionQuery,
  useGetGraphicThemesQuery,
  useRefreshGraphicSignedUrlMutation,
  useUpsertGraphicSessionMutation,
} from './matchGraphicsApi';
export {
  useAddQuickMatchPlayerMutation,
  useCreateQuickMatchMutation,
  useCreateTournamentMatchMutation,
  useGetMatchLiveSnapshotQuery,
  useGetMatchResultQuery,
  useGetQuickMatchesQuery,
  useSetPlayerOfMatchMutation,
} from './matchListApi';
export {
  useDeleteBallMutation,
  useDeleteLastBallMutation,
  useGetScorecardQuery,
  useGetScoringFixtureQuery,
  useGetScoringStateQuery,
  useStoreAdditionalRunsMutation,
  useStoreBallMutation,
  useUpdateBallMutation,
  useUpdateCreaseMutation,
  useUpdateTossMutation,
} from './matchScoringApi';
export {
  useGetMatchTeamSquadQuery,
  useGetTeamSquadQuery,
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
  useUpdateMatchCaptainMutation,
  useUpdateMatchWicketKeeperMutation,
  useUpdateTeamSquadMutation,
} from './matchSquadApi';

/** Re-export for tests that assert wire parsing. */
export type { MatchDetailWire, MatchStateWire } from '../model/liveSchemas';
export type { QuickMatchWire } from '../model/schemas';
