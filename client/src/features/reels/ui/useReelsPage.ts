import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';
import { useFollowUserMutation } from '@/features/explore';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { shareLink } from '@/shared/native/share';
import { useKeepAwake } from '@/shared/native/useKeepAwake';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { toast } from '@/shared/ui/toast';

import {
  reelsApi,
  useGetReelQuery,
  useGetReelsQuery,
  useLikeReelMutation,
  useSaveReelMutation,
  useShareReelMutation,
  useUnlikeReelMutation,
  useUnsaveReelMutation,
} from '../api/reelsApi';
import { useReelPrefetch } from '../lib/useReelPrefetch';
import { useReelsTabLayout } from '../lib/useReelsTabLayout';
import { type Reel, REEL_TAB_META, REEL_TABS, type ReelTab } from '../model/schemas';
import { buildReelShareUrl } from '../routes';

/** Feed query, scroll/desk navigation, and slide actions for ReelsPage. */
export function useReelsPage() {
  const { id: idParam } = useParams<{ id?: string }>();
  const focusedId = idParam ? Number(idParam) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const desk = useReelsTabLayout();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthenticated });
  useKeepAwake(true);

  const [tab, setTab] = useState<ReelTab>('explore');
  const [cursor, setCursor] = useState<string | undefined>();
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [soundTip, setSoundTip] = useState(true);
  const [commentsForId, setCommentsForId] = useState<number | null>(null);
  const [reportForId, setReportForId] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const loadMoreLock = useRef(false);

  const tabMeta = REEL_TAB_META.find((t) => t.id === tab);
  const feedTab: ReelTab = tabMeta?.requiresAuth && !isAuthenticated ? 'explore' : tab;
  const { data, isLoading, isError, isFetching, refetch } = useGetReelsQuery(
    cursor ? { tab: feedTab, cursor } : { tab: feedTab }
  );
  const focusedReelId = focusedId != null && Number.isFinite(focusedId) ? focusedId : 0;
  const { data: focusedReel } = useGetReelQuery(focusedReelId, {
    skip: focusedReelId <= 0,
  });

  const [likeReel] = useLikeReelMutation();
  const [unlikeReel] = useUnlikeReelMutation();
  const [saveReel] = useSaveReelMutation();
  const [unsaveReel] = useUnsaveReelMutation();
  const [shareReel] = useShareReelMutation();
  const [followUser] = useFollowUserMutation();

  const ordered = useMemo(() => {
    const feedItems = data?.items ?? [];
    if (focusedReel && !feedItems.some((r) => r.id === focusedReel.id)) {
      return [focusedReel, ...feedItems];
    }
    if (focusedId && feedItems.length) {
      const hit = feedItems.find((r) => r.id === focusedId);
      if (hit) return [hit, ...feedItems.filter((r) => r.id !== hit.id)];
    }
    return feedItems;
  }, [data?.items, focusedId, focusedReel]);

  const current = ordered[active] ?? ordered[0];

  function selectTab(next: ReelTab) {
    const meta = REEL_TAB_META.find((t) => t.id === next);
    if (meta?.requiresAuth && !isAuthenticated) {
      navigate(APP_PATHS.login, {
        state: { returnTo: `${location.pathname}${location.search}` },
      });
      return;
    }
    setTab(next);
    setCursor(undefined);
    setActive(0);
    setCommentsForId(null);
    setReportForId(null);
    scroller.current?.scrollTo?.({ top: 0 });
  }

  const loadMore = useCallback(() => {
    if (loadMoreLock.current || isFetching) return;
    const next = data?.nextCursor;
    if (!data?.hasMore || !next) return;
    loadMoreLock.current = true;
    setCursor(next);
  }, [data?.hasMore, data?.nextCursor, isFetching]);

  useEffect(() => {
    if (!isFetching) loadMoreLock.current = false;
  }, [isFetching]);

  /** Prefetch posters + first bytes for upcoming slides. */
  useReelPrefetch(ordered, active);

  // Load next page near scroll end (~2 viewports) so prefetch/player window stay fed.
  useEffect(() => {
    const root = scroller.current;
    if (!root || desk) return undefined;

    function onScroll() {
      const el = scroller.current;
      if (!el) return;
      const { scrollTop, clientHeight, scrollHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
        loadMore();
      }
    }

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [desk, loadMore, ordered.length]);

  // Desk / fast snap: load when active index is near list end (may skip scroll threshold).
  const maybeLoadMoreNearEnd = useCallback(
    (index: number) => {
      if (index >= ordered.length - 4) loadMore();
    },
    [loadMore, ordered.length]
  );

  useEffect(() => {
    const root = scroller.current;
    if (!root || desk) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const next = Number((entry.target as HTMLElement).dataset.index);
            setActive(next);
            maybeLoadMoreNearEnd(next);
          }
        }
      },
      { root, threshold: 0.6 }
    );
    for (const child of root.children) io.observe(child);
    return () => io.disconnect();
  }, [ordered.length, feedTab, desk, maybeLoadMoreNearEnd]);

  const skip = useCallback(
    (dir: number) => {
      setCommentsForId(null);
      setReportForId(null);
      const next = active + dir;
      if (next < 0 || next >= ordered.length) return;
      scroller.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(next);
      maybeLoadMoreNearEnd(next);
    },
    [active, maybeLoadMoreNearEnd, ordered.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented) return;
      const el = e.target;
      if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        skip(1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        skip(-1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);

  async function toggleLike(reel: Reel) {
    try {
      if (reel.liked) await unlikeReel(reel.id).unwrap();
      else await likeReel(reel.id).unwrap();
    } catch {
      toast({ title: 'Could Not Update Like', tone: 'error' });
    }
  }

  async function toggleSave(reel: Reel) {
    try {
      if (reel.saved) await unsaveReel(reel.id).unwrap();
      else await saveReel(reel.id).unwrap();
    } catch {
      toast({ title: 'Could Not Update Save', tone: 'error' });
    }
  }

  async function share(reel: Reel) {
    // URL only — HTTPS deep link (Capacitor origin is unusable for shares).
    const channel = await shareLink({ url: buildReelShareUrl(reel.id) });
    if (channel === 'copied') toast({ title: 'Link Copied', tone: 'success' });
    if (channel === 'cancelled' || !isAuthenticated) return;
    try {
      await shareReel({ id: reel.id, channel }).unwrap();
    } catch {
      /* share sheet already succeeded — count bump is best-effort */
    }
  }

  function patchAuthorFollowing(authorId: number, following: boolean) {
    for (const t of REEL_TABS) {
      dispatch(
        reelsApi.util.updateQueryData('getReels', { tab: t }, (draft) => {
          for (const item of draft.items) {
            if (item.author.id === authorId) item.author.following = following;
          }
        })
      );
    }
    if (current) {
      dispatch(
        reelsApi.util.updateQueryData('getReel', current.id, (draft) => {
          if (draft.author.id === authorId) draft.author.following = following;
        })
      );
    }
  }

  async function follow(reel: Reel) {
    const authorId = reel.author.id;
    if (reel.author.following || authorId == null) return;
    patchAuthorFollowing(authorId, true);
    try {
      await followUser(authorId).unwrap();
    } catch (err) {
      patchAuthorFollowing(authorId, false);
      toast({ title: getApiErrorMessage(err, 'Could not update follow.'), tone: 'error' });
    }
  }

  function isOwn(reel: Reel) {
    return me != null && reel.author.id != null && me.id === reel.author.id;
  }

  const slideHandlers = (reel: Reel) => ({
    onLike: () => void toggleLike(reel),
    onFollow: () => void follow(reel),
    onComments: () => setCommentsForId(reel.id),
    onReport: () => setReportForId(reel.id),
    onSave: () => void toggleSave(reel),
    onShare: () => void share(reel),
  });

  return {
    desk,
    feedTab,
    selectTab,
    ordered,
    current,
    active,
    muted,
    setMuted,
    soundTip,
    setSoundTip,
    commentsForId,
    setCommentsForId,
    reportForId,
    setReportForId,
    scroller,
    isLoading,
    isError,
    refetch,
    skip,
    isOwn,
    slideHandlers,
  };
}
