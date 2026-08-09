/**
 * Public creator profile for reels — opened from the feed action-rail avatar.
 * Route: /reels/u/:userId
 *
 * Everyone: Reels / Posts tabs.
 * Own profile also: Liked / Saved (private).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { OfficialBadge } from '@/components/OfficialBadge';
import { ReelPosterGrid } from '@/components/reels/ReelPosterGrid';
import { UserAvatar } from '@/components/UserAvatar';
import { composeDestination } from '@/lib/feed/composeDestination';
import { formatCount } from '@/lib/format';
import { buildCreatorProfileShareUrl, shareLink } from '@/lib/share';
import PostCard from '@/pages/feed/PostCard';
import { useGetUserPostsQuery, useLazyGetUserPostsQuery } from '@/store/api/feedApi';
import {
  useFollowReelCreatorMutation,
  useGetLikedReelsQuery,
  useGetSavedReelsQuery,
  useGetUserProfileQuery,
  useGetUserReelsQuery,
  useLazyGetLikedReelsQuery,
  useLazyGetSavedReelsQuery,
  useLazyGetUserReelsQuery,
  useUnfollowReelCreatorMutation,
} from '@/store/api/reelsApi';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUserAndToken } from '@/store/selectors';
import { Container } from '@/ui/Container';

const TAB_REELS = 'reels';
const TAB_POSTS = 'posts';
const TAB_LIKED = 'liked';
const TAB_SAVED = 'saved';

function LocationPinIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShareIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReelsTabIcon({ className = 'size-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LikedTabIcon({ className = 'size-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function SavedTabIcon({ className = 'size-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PostsTabIcon({ className = 'size-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

const SHARED_TABS = [
  { id: TAB_REELS, label: 'Reels', Icon: ReelsTabIcon },
  { id: TAB_POSTS, label: 'Posts', Icon: PostsTabIcon },
];

const OWN_TABS = [
  ...SHARED_TABS,
  { id: TAB_LIKED, label: 'Liked', Icon: LikedTabIcon },
  { id: TAB_SAVED, label: 'Saved', Icon: SavedTabIcon },
];

export default function CreatorReelsProfile() {
  const { userId: userIdParam } = useParams();
  const userId = Number(userIdParam);
  const validUserId = Number.isFinite(userId) && userId > 0;

  const navigate = useNavigate();
  const { user: currentUser, accessToken } = useAppSelector(selectAuthUserAndToken);
  const isAuthed = Boolean(accessToken);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetUserProfileQuery(userId, { skip: !validUserId });

  const isOwnProfile = currentUser?.id != null && profile?.id != null && Number(currentUser.id) === Number(profile.id);

  const [activeTab, setActiveTab] = useState(TAB_REELS);

  useEffect(() => {
    if (!isOwnProfile && activeTab !== TAB_REELS && activeTab !== TAB_POSTS) {
      setActiveTab(TAB_REELS);
    }
  }, [isOwnProfile, activeTab]);

  const reelsQuery = useGetUserReelsQuery({ userId, perPage: 18 }, { skip: !validUserId || activeTab !== TAB_REELS });
  const postsQuery = useGetUserPostsQuery({ userId, perPage: 10 }, { skip: !validUserId || activeTab !== TAB_POSTS });
  const likedQuery = useGetLikedReelsQuery({ perPage: 18 }, { skip: !isOwnProfile || !isAuthed || activeTab !== TAB_LIKED });
  const savedQuery = useGetSavedReelsQuery({ perPage: 18 }, { skip: !isOwnProfile || !isAuthed || activeTab !== TAB_SAVED });

  const [fetchMoreReels] = useLazyGetUserReelsQuery();
  const [fetchMorePosts] = useLazyGetUserPostsQuery();
  const [fetchMoreLiked] = useLazyGetLikedReelsQuery();
  const [fetchMoreSaved] = useLazyGetSavedReelsQuery();
  const [followCreator, { isLoading: isFollowing }] = useFollowReelCreatorMutation();
  const [unfollowCreator, { isLoading: isUnfollowing }] = useUnfollowReelCreatorMutation();
  const [shareHint, setShareHint] = useState('');

  const displayName = profile?.name || profile?.nickname || 'Creator';
  const handle = profile?.nickname ? `@${profile.nickname}` : null;
  const headerTitle = (profile?.nickname || profile?.name || 'PROFILE').toUpperCase();

  const locationLabel = useMemo(() => {
    if (!profile) return null;
    const parts = [profile.city, profile.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }, [profile]);

  const roleStylePills = useMemo(() => {
    if (!profile) return [];
    const role = String(profile.playingRoleEnum || '').toUpperCase();
    const pills = [];

    if (profile.playingRole) {
      pills.push(profile.playingRole);
    }

    const showBatting = role === 'BATSMAN' || role === 'ALL_ROUNDER';
    const showBowling = role === 'BOWLER' || role === 'ALL_ROUNDER';

    if (showBatting && profile.battingStyle) {
      pills.push(profile.battingStyle);
    }
    if (showBowling && profile.bowlingStyle) {
      pills.push(profile.bowlingStyle);
    }

    if (!role) {
      if (profile.battingStyle && !pills.includes(profile.battingStyle)) {
        pills.push(profile.battingStyle);
      }
      if (profile.bowlingStyle && !pills.includes(profile.bowlingStyle)) {
        pills.push(profile.bowlingStyle);
      }
    }

    return pills;
  }, [profile]);

  const stats = useMemo(
    () => [
      { label: 'Following', value: formatCount(profile?.followingCount ?? 0) },
      { label: 'Followers', value: formatCount(profile?.followersCount ?? 0) },
      { label: 'Reels', value: formatCount(profile?.reelsCount ?? 0) },
    ],
    [profile],
  );

  const activeQuery =
    activeTab === TAB_POSTS
      ? postsQuery
      : activeTab === TAB_LIKED
        ? likedQuery
        : activeTab === TAB_SAVED
          ? savedQuery
          : reelsQuery;

  const items = activeQuery.data?.items ?? [];
  const nextCursor = activeQuery.data?.nextCursor ?? null;
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;
  const isError = activeQuery.isError;

  const emptyCopy =
    activeTab === TAB_POSTS
      ? 'No posts yet.'
      : activeTab === TAB_LIKED
        ? 'No liked reels yet.'
        : activeTab === TAB_SAVED
          ? 'No saved reels yet.'
          : 'No reels yet.';

  const emptyAction =
    activeTab === TAB_REELS && isOwnProfile
      ? { to: '/reels/upload', label: 'Upload a Reel' }
      : activeTab === TAB_POSTS && isOwnProfile
        ? { to: composeDestination(undefined, isAuthed), label: 'Create a Post' }
        : null;

  const requireAuth = useCallback(
    (nextPath) => {
      navigate('/login', { state: { from: { pathname: nextPath || `/reels/u/${userId}` } } });
    },
    [navigate, userId],
  );

  const handleFollowToggle = async () => {
    if (!profile?.id) return;
    if (!isAuthed) {
      requireAuth();
      return;
    }
    try {
      if (profile.isFollowing) {
        await unfollowCreator(profile.id).unwrap();
      } else {
        await followCreator(profile.id).unwrap();
      }
    } catch {
      // Optimistic patch rolls back on failure.
    }
  };

  const handleShare = async () => {
    if (!profile?.id) return;
    const channel = await shareLink({
      url: buildCreatorProfileShareUrl(profile.id),
      title: displayName,
      text: handle ? `${displayName} (${handle}) on Tapeya` : `${displayName} on Tapeya`,
    });
    if (channel === 'copy_link') {
      setShareHint('Link copied');
      window.setTimeout(() => setShareHint(''), 2000);
    }
  };

  const selectTab = (tabId) => {
    if ((tabId === TAB_LIKED || tabId === TAB_SAVED) && !isOwnProfile) return;
    if ((tabId === TAB_LIKED || tabId === TAB_SAVED) && !isAuthed) {
      requireAuth();
      return;
    }
    setActiveTab(tabId);
  };

  const loadMore = async () => {
    if (!nextCursor || isFetching) return;
    if (activeTab === TAB_POSTS) {
      await fetchMorePosts({ userId, cursor: nextCursor, perPage: 10 });
      return;
    }
    if (activeTab === TAB_LIKED) {
      await fetchMoreLiked({ cursor: nextCursor, perPage: 18 });
      return;
    }
    if (activeTab === TAB_SAVED) {
      await fetchMoreSaved({ cursor: nextCursor, perPage: 18 });
      return;
    }
    await fetchMoreReels({ userId, cursor: nextCursor, perPage: 18 });
  };

  if (!validUserId) {
    return (
      <div className="bg-black">
        <AppSubpageHeader sticky title="PROFILE" />
        <Container>
          <p className="text-muted text-sm">Profile not found.</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black pb-6">
      <AppSubpageHeader sticky title={headerTitle} />

      <Container>
        {profileLoading ? (
          <p className="text-muted text-sm">Loading profile…</p>
        ) : profileError || !profile ? (
          <p className="text-muted text-sm">Could not load this profile.</p>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <UserAvatar src={profile.avatarUrl} name={displayName} size="2xl" />

              <h1 className="mt-3 inline-flex max-w-full items-center justify-center gap-1.5 text-[20px] font-bold text-white">
                <span className="truncate">{displayName}</span>
                <OfficialBadge isOfficial={profile.isOfficial} size="md" />
              </h1>
              {handle ? <p className="text-muted mt-0.5 text-[13px]">{handle}</p> : null}

              {roleStylePills.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  {roleStylePills.map((label) => (
                    <span
                      key={label}
                      className="bg-surface text-muted inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {stats.map(({ label, value }) => (
                <div key={label} className="bg-surface rounded-[14px] px-2 py-3 text-center">
                  <div className="text-[16px] font-bold text-white">{value}</div>
                  <div className="text-muted mt-1 text-[11px] font-bold tracking-wide uppercase">{label}</div>
                </div>
              ))}
            </div>

            {locationLabel ? (
              <p className="text-muted mt-4 flex items-center justify-center gap-1.5 text-[12px]">
                <LocationPinIcon />
                {locationLabel}
              </p>
            ) : null}

            <div className="mt-4 flex items-center gap-2">
              {isOwnProfile ? (
                <Link
                  to="/profile"
                  className="border-brand text-brand flex h-11 flex-1 items-center justify-center rounded-[10px] border text-[14px] font-bold transition-opacity active:opacity-90"
                >
                  Edit Profile
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={isFollowing || isUnfollowing}
                  className={
                    profile.isFollowing
                      ? 'bg-surface text-muted flex h-11 flex-1 items-center justify-center rounded-[10px] text-[14px] font-bold transition-opacity active:opacity-90 disabled:opacity-60'
                      : 'bg-brand text-ink flex h-11 flex-1 items-center justify-center rounded-[10px] text-[14px] font-bold transition-opacity active:opacity-90 disabled:opacity-60'
                  }
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="bg-surface text-muted flex h-11 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-bold transition-opacity active:opacity-90"
                aria-label="Share profile"
              >
                <ShareIcon />
                Share
              </button>
            </div>

            {shareHint ? <p className="text-brand mt-2 text-center text-[12px]">{shareHint}</p> : null}

            <nav className="mt-6" aria-label="Profile content tabs">
              <div className="flex items-center gap-0.5 rounded-full border border-white/12 bg-black/55 p-1">
                {(isOwnProfile ? OWN_TABS : SHARED_TABS).map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectTab(id)}
                      aria-current={active ? 'page' : undefined}
                      aria-label={label}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 sm:gap-1.5 sm:text-[12px] ${
                        active
                          ? 'bg-brand text-ink px-2 py-2.5 shadow-sm sm:px-3'
                          : 'py-2.5 text-white/65 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="mt-4">
              {isLoading ? (
                <p className="text-muted py-8 text-center text-sm">
                  {activeTab === TAB_POSTS ? 'Loading posts…' : 'Loading reels…'}
                </p>
              ) : isError ? (
                <p className="text-muted py-8 text-center text-sm">
                  {activeTab === TAB_POSTS ? 'Could not load posts.' : 'Could not load reels.'}
                </p>
              ) : activeTab === TAB_POSTS ? (
                <>
                  {items.length ? (
                    <div className="-mx-4 space-y-2">
                      {items.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-muted text-sm">{emptyCopy}</p>
                      {emptyAction ? (
                        <Link to={emptyAction.to} className="text-brand mt-2 inline-block text-sm font-semibold">
                          {emptyAction.label}
                        </Link>
                      ) : null}
                    </div>
                  )}
                  {nextCursor ? (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={isFetching}
                        className="text-muted text-[12px] font-semibold transition-opacity active:opacity-90 disabled:opacity-60"
                      >
                        {isFetching ? 'Loading…' : 'Load more'}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <ReelPosterGrid items={items} emptyMessage={emptyCopy} emptyAction={emptyAction} />
                  {nextCursor ? (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={isFetching}
                        className="text-muted text-[12px] font-semibold transition-opacity active:opacity-90 disabled:opacity-60"
                      >
                        {isFetching ? 'Loading…' : 'Load more'}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
