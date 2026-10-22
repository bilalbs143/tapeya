export {
  useAddDramaEpisodeCommentMutation,
  useDeleteDramaEpisodeCommentMutation,
  useDislikeDramaEpisodeMutation,
  useGetDramaEpisodeCommentsQuery,
  useGetDramaEpisodeQuery,
  useGetDramaSerialQuery,
  useGetDramaSerialsQuery,
  useLazyGetDramaEpisodeCommentRepliesQuery,
  useLikeDramaEpisodeCommentMutation,
  useLikeDramaEpisodeMutation,
  useShareDramaEpisodeMutation,
  useUnlikeDramaEpisodeCommentMutation,
} from './api/entertainmentApi';
export type { DramaEpisode, DramaEpisodeSummary, DramaSerial } from './model/schemas';
export { entertainmentPaths, entertainmentRedirectObjects, entertainmentRouteObjects } from './routes';
