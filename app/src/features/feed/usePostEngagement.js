import { useCallback } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { buildPostShareUrl } from '@/lib/utils/postShareUtils';
import {
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
  useSharePostMutation,
  useUnlikePostMutation,
  useUnsavePostMutation,
} from '@/store/api/feedApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';

/**
 * Like / save / share / repost for a feed post (card or detail).
 *
 * @param {{ id?: string|number, type?: string, liked?: boolean, saved?: boolean, authorName?: string, caption?: string, description?: string, body?: string }|null|undefined} post
 */
export function usePostEngagement(post) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();
  const [sharePost] = useSharePostMutation();
  const [repostPost, { isLoading: isReposting }] = useRepostPostMutation();

  const requireAuth = useCallback(
    (fn) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location } });
        return;
      }
      fn();
    },
    [isAuthenticated, location, navigate],
  );

  const toggleLike = useCallback(() => {
    if (!post?.id) return;
    requireAuth(() => {
      if (post.liked) unlikePost(post.id);
      else likePost(post.id);
    });
  }, [likePost, post, requireAuth, unlikePost]);

  const toggleSave = useCallback(() => {
    if (!post?.id) return;
    requireAuth(() => {
      if (post.saved) unsavePost(post.id);
      else savePost(post.id);
    });
  }, [post, requireAuth, savePost, unsavePost]);

  const share = useCallback(async () => {
    if (!post?.id) return;
    const shareUrl = buildPostShareUrl(post);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        // URL only — no title/caption so shares stay a clean deep link.
        await navigator.share({ url: shareUrl });
        if (isAuthenticated) {
          await sharePost({ id: post.id, channel: 'system_share' });
        }
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        if (isAuthenticated) {
          await sharePost({ id: post.id, channel: 'copy_link' });
        }
      } else if (isAuthenticated) {
        await sharePost({ id: post.id, channel: 'other' });
      }
    } catch {
      // User cancelled share sheet — ignore.
    }
  }, [isAuthenticated, post, sharePost]);

  const repost = useCallback(() => {
    if (!post?.id || isReposting) return;
    requireAuth(async () => {
      try {
        await repostPost({ id: post.id }).unwrap();
      } catch {
        // Feed invalidation still runs on success only; surface nothing for cancel/error.
      }
    });
  }, [isReposting, post, repostPost, requireAuth]);

  return {
    isAuthenticated,
    isReposting,
    toggleLike,
    toggleSave,
    share,
    repost,
  };
}
