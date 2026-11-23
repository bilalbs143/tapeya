import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';
import { confirmBlockUser, useFollowUserMutation, useUnfollowUserMutation } from '@/features/explore';
import { useGetUserPostsQuery } from '@/features/feed';
import { useGetUserReelsQuery } from '@/features/reels';

import { userHandle } from '@/entities/user';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { useCursorLoadMore } from '@/shared/hooks/useCursorLoadMore';
import { shareLink } from '@/shared/native/share';
import { useAppDispatch } from '@/shared/store/hooks';
import { toast } from '@/shared/ui/toast';

import { useGetUserProfileQuery, useLookupUsersQuery } from '../api/profileApi';
import { PROFILE_REELS_PER_PAGE } from '../lib/profileShelves';
import { publicProfileShareTitle, type PublicProfileTab } from '../lib/publicProfile';
import { parseProfileHandle } from '../lib/resolveHandle';
import { profileRoutes } from '../routes';

/** Resolve handle, shelves, follow/share/block for PublicProfilePage. */
export function usePublicProfile() {
  const { handle: rawHandle } = useParams();
  const parsed = parseProfileHandle(rawHandle);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<PublicProfileTab>('reels');
  const [reelsCursor, setReelsCursor] = useState<string | undefined>();
  const [reportOpen, setReportOpen] = useState(false);

  const lookupSearch = parsed?.kind === 'nickname' ? parsed.nickname : '';
  const {
    data: lookupHits,
    isLoading: lookupLoading,
    isError: lookupError,
  } = useLookupUsersQuery(lookupSearch, { skip: parsed?.kind !== 'nickname' });

  const userId = useMemo(() => {
    if (!parsed) return null;
    if (parsed.kind === 'id') return parsed.id;
    const needle = parsed.nickname.toLowerCase();
    const hit = lookupHits?.find((u) => u.nickname?.trim().toLowerCase() === needle);
    return hit?.id ?? null;
  }, [parsed, lookupHits]);

  const resolving = parsed?.kind === 'nickname' && lookupLoading;
  const resolveFailed =
    parsed?.kind === 'nickname' && !lookupLoading && (lookupError || (lookupHits != null && userId == null));

  const { data: me } = useMeQuery();
  const isOwn = Boolean(me && userId != null && me.id === userId);
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useGetUserProfileQuery(userId ?? 0, { skip: userId == null || isOwn });

  const reelsActive = userId != null && !isOwn && tab === 'reels';
  const {
    data: reelsPage,
    isLoading: reelsLoading,
    isFetching: reelsFetching,
    refetch: refetchReels,
  } = useGetUserReelsQuery(
    { userId: userId ?? 0, cursor: reelsCursor, perPage: PROFILE_REELS_PER_PAGE },
    { skip: !reelsActive }
  );

  const reels = reelsPage?.items ?? [];
  const {
    canLoadMore: canLoadMoreReels,
    loadingMore: loadingMoreReels,
    loadMoreRef: loadMoreReelsRef,
  } = useCursorLoadMore({
    enabled: reelsActive,
    cursor: reelsCursor,
    onCursorChange: setReelsCursor,
    page: reelsPage,
    itemCount: reels.length,
    isFetching: reelsFetching,
    refetch: refetchReels,
    pageRoot: true,
  });

  const { data: postsPage, isLoading: postsLoading } = useGetUserPostsQuery(
    { userId: userId ?? 0 },
    { skip: userId == null || isOwn || tab !== 'posts' }
  );

  const [follow, { isLoading: following }] = useFollowUserMutation();
  const [unfollow, { isLoading: unfollowing }] = useUnfollowUserMutation();

  async function handleFollowToggle() {
    if (!profile) return;
    try {
      if (profile.isFollowing) await unfollow(profile.id).unwrap();
      else await follow(profile.id).unwrap();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not update follow.'), tone: 'error' });
    }
  }

  async function handleShare() {
    if (!profile) return;
    const handle = userHandle(profile);
    const result = await shareLink({
      title: publicProfileShareTitle(profile.name, handle),
      url: `${window.location.origin}${profileRoutes.user(profile)}`,
    });
    if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
  }

  async function handleBlock() {
    if (!profile) return;
    await confirmBlockUser({
      dispatch,
      userId: profile.id,
      userName: profile.name ?? userHandle(profile),
      isBlocked: profile.isBlocked,
      onBlocked: () => navigate(APP_PATHS.home, { replace: true }),
    });
  }

  function goBack() {
    navigate(-1);
  }

  function selectTab(next: string) {
    setTab(next as PublicProfileTab);
    setReelsCursor(undefined);
  }

  return {
    parsed,
    resolving,
    resolveFailed,
    userId,
    isOwn,
    profile,
    isLoading,
    isError,
    refetch,
    tab,
    selectTab,
    reportOpen,
    setReportOpen,
    reelsPage,
    reelsLoading: reelsLoading && !reelsPage,
    canLoadMoreReels,
    loadingMoreReels,
    loadMoreReelsRef,
    postsPage,
    postsLoading,
    following,
    unfollowing,
    handleFollowToggle,
    handleShare,
    handleBlock,
    goBack,
  };
}
