export {
  useDislikeHighlightMutation,
  useGetHighlightQuery,
  useGetHighlightsQuery,
  useLikeHighlightMutation,
  useShareHighlightMutation,
} from './api/highlightsApi';
export type { Highlight } from './model/schemas';
export { highlightRouteObjects, highlightRoutes } from './routes';
