import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';
import { useGetSuggestedUsersQuery } from '@/features/explore';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useCursorSentinel } from '@/shared/hooks/useCursorSentinel';
import { selectUserId } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';
import { toast } from '@/shared/ui/toast';

import {
  useGetFeedQuery,
  useGetReelBandQuery,
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
  useUnlikePostMutation,
  useUnsavePostMutation,
} from '../api/feedApi';
import { feedCommentHref } from '../lib/feedPage';
import { useFeedHomeWidgets } from '../lib/useFeedHomeData';
import type { FeedTab } from '../model/schemas';

/** Home feed tabs, cursor pagination, and post actions. */
export function useFeedPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FeedTab>('explore');
  const [cursor, setCursor] = useState<string | undefined>();
  const userId = useAppSelector(selectUserId);
  const { data: me } = useMeQuery();

  const home = useFeedHomeWidgets(true);

  const { data, isLoading, isError, isFetching, refetch } = useGetFeedQuery(cursor ? { tab, cursor } : { tab });
  const { data: reels, isLoading: reelsLoading } = useGetReelBandQuery(undefined, { skip: tab !== 'explore' });
  const { data: suggestions } = useGetSuggestedUsersQuery(
    { limit: 20 },
    { skip: tab !== 'explore' && tab !== 'following' }
  );

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();
  const [repostPost, { isLoading: reposting }] = useRepostPostMutation();

  const posts = data?.items ?? [];
  const exhausted = Boolean(data && !data.hasMore);
  const showInitialLoading = isLoading && !data;
  const refreshing = isFetching && !isLoading && !cursor && Boolean(data);

  function selectTab(next: string) {
    setTab(next as FeedTab);
    setCursor(undefined);
  }

  async function toggleLike(postId: number, liked: boolean) {
    try {
      if (liked) await unlikePost(postId).unwrap();
      else await likePost(postId).unwrap();
    } catch {
      toast({ title: 'Could Not Update Like', tone: 'error' });
    }
  }

  async function toggleSave(postId: number, saved: boolean) {
    try {
      if (saved) await unsavePost(postId).unwrap();
      else await savePost(postId).unwrap();
    } catch {
      toast({ title: 'Could Not Update Save', tone: 'error' });
    }
  }

  async function repost(postId: number) {
    try {
      await repostPost({ postId }).unwrap();
      toast({ title: 'Reposted', tone: 'success' });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not repost.'), tone: 'error' });
    }
  }

  const canLoadMore = Boolean(posts.length > 0 && data?.hasMore && data.nextCursor);
  const nextCursor = data?.nextCursor;

  const loadMoreRef = useCursorSentinel({
    enabled: canLoadMore && !isFetching,
    onIntersect: () => {
      if (nextCursor && !isFetching) setCursor(nextCursor);
    },
  });

  function openComments(post: { id: number; kind: string }) {
    navigate(feedCommentHref(post));
  }

  return {
    navigate,
    tab,
    selectTab,
    cursor,
    userId,
    me,
    home,
    posts,
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    reels,
    reelsLoading,
    suggestions,
    exhausted,
    showInitialLoading,
    refreshing,
    canLoadMore,
    loadMoreRef,
    reposting,
    toggleLike,
    toggleSave,
    repost,
    openComments,
  };
}
