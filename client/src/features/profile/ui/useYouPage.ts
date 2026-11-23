import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';
import { useGetFeedQuery } from '@/features/feed';
import { useGetReelsQuery } from '@/features/reels';

import { userHandle } from '@/entities/user';

import { APP_PATHS } from '@/shared/config/paths';
import { useCursorLoadMore } from '@/shared/hooks/useCursorLoadMore';
import { shareLink } from '@/shared/native/share';
import { toast } from '@/shared/ui/toast';

import { PROFILE_REELS_PER_PAGE } from '../lib/profileShelves';
import { publicProfileShareTitle } from '../lib/publicProfile';
import { type YouProfileTab } from '../lib/youPage';

/** Own profile shelves (reels / posts / saved) and share for YouPage. */
export function useYouPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<YouProfileTab>('reels');
  const [reelsCursor, setReelsCursor] = useState<string | undefined>();
  const { data: me, isLoading, isError, refetch } = useMeQuery();

  const reelsActive = Boolean(me && tab === 'reels');
  const {
    data: mineReels,
    isLoading: reelsLoading,
    isError: reelsError,
    isFetching: reelsFetching,
    refetch: refetchReels,
  } = useGetReelsQuery({ tab: 'mine', cursor: reelsCursor, perPage: PROFILE_REELS_PER_PAGE }, { skip: !reelsActive });

  const reels = mineReels?.items ?? [];
  const {
    canLoadMore: canLoadMoreReels,
    loadingMore: loadingMoreReels,
    loadMoreRef: loadMoreReelsRef,
  } = useCursorLoadMore({
    enabled: reelsActive,
    cursor: reelsCursor,
    onCursorChange: setReelsCursor,
    page: mineReels,
    itemCount: reels.length,
    isFetching: reelsFetching,
    refetch: refetchReels,
    pageRoot: true,
  });

  const {
    data: minePosts,
    isLoading: postsLoading,
    isError: postsError,
    refetch: refetchPosts,
  } = useGetFeedQuery({ tab: 'mine' }, { skip: !me || tab !== 'posts' });
  const {
    data: savedPosts,
    isLoading: savedLoading,
    isError: savedError,
    refetch: refetchSaved,
  } = useGetFeedQuery({ tab: 'saved' }, { skip: !me || tab !== 'saved' });

  const posts = minePosts?.items ?? [];
  const saved = savedPosts?.items ?? [];

  function selectTab(value: string) {
    setTab(value as YouProfileTab);
    setReelsCursor(undefined);
  }

  async function handleShare() {
    if (!me) return;
    const handle = userHandle(me);
    const result = await shareLink({
      title: publicProfileShareTitle(me.name, handle),
      url: `${window.location.origin}${APP_PATHS.you}`,
    });
    if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
  }

  function goEdit() {
    navigate(APP_PATHS.profile);
  }

  function goCreateReel() {
    navigate(APP_PATHS.createReel);
  }

  return {
    me,
    isLoading,
    isError,
    refetch,
    tab,
    selectTab,
    reels,
    reelsLoading: reelsLoading && !mineReels,
    reelsError,
    refetchReels,
    canLoadMoreReels,
    loadingMoreReels,
    loadMoreReelsRef,
    posts,
    postsLoading,
    postsError,
    refetchPosts,
    saved,
    savedLoading,
    savedError,
    refetchSaved,
    handleShare,
    goEdit,
    goCreateReel,
  };
}
