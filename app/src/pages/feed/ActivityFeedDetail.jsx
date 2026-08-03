import { useEffect, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import PostCommentsThread from '@/components/feed/PostCommentsThread';
import RepostedPostEmbed from '@/components/feed/RepostedPostEmbed';
import TextPostBackground from '@/components/feed/TextPostBackground';
import { OfficialBadge } from '@/components/OfficialBadge';
import { usePostEngagement } from '@/features/feed/usePostEngagement';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { getFeedTextBackground } from '@/lib/constants/composeBackgrounds';
import { formatCount } from '@/lib/format';
import { formatPostTimestamp } from '@/lib/utils/feedUtils';
import { ActionButton, BookmarkIcon, CommentIcon, FollowChip, HeartIcon, RepostIcon, ShareIcon } from '@/pages/feed/PostCard';
import { useGetPostQuery } from '@/store/api/feedApi';
import { useFollowReelCreatorMutation, useUnfollowReelCreatorMutation } from '@/store/api/reelsApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Container } from '@/ui/Container';

const AVATAR_PLACEHOLDER = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;
const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%231a1a1a" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%234a5568" font-size="24" font-family="sans-serif"%3EImage%3C/text%3E%3C/svg%3E';

/**
 * Activity Feed Detail — same hierarchy as PostCard; video posts redirect to reels.
 * Comments use the same reel-style thread UI, inline (not a bottom sheet).
 */
export default function ActivityFeedDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectUser);

  const { data: post, isLoading, isError } = useGetPostQuery(postId, { skip: !postId });
  const [followCreator, { isLoading: isFollowPending }] = useFollowReelCreatorMutation();
  const [unfollowCreator, { isLoading: isUnfollowPending }] = useUnfollowReelCreatorMutation();
  const { toggleLike, toggleSave, share, repost, isReposting } = usePostEngagement(post);

  const [imageError, setImageError] = useState(false);
  const [authorAvatarError, setAuthorAvatarError] = useState(false);
  const [stickyCommentComposer, setStickyCommentComposer] = useState(false);

  useEffect(() => {
    if (post?.type === 'video') {
      navigate(`/reels/${post.id}`, { replace: true });
    }
  }, [post, navigate]);

  useEffect(() => {
    if (location.hash === '#comments' && post && post.type !== 'video') {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, post]);

  useEffect(() => {
    const updateComposerPosition = () => setStickyCommentComposer(window.scrollY > 24);
    updateComposerPosition();
    window.addEventListener('scroll', updateComposerPosition, { passive: true });
    return () => window.removeEventListener('scroll', updateComposerPosition);
  }, [postId]);

  const formattedTimestamp = useMemo(() => (post ? formatPostTimestamp(post.publishedAt) : ''), [post]);

  const scrollToComments = () => {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      document.querySelector('#comments textarea')?.focus({ preventScroll: true });
    }, 350);
  };

  if (isLoading) {
    return (
      <div className="bg-black text-white">
        <AppSubpageHeader sticky title="ACTIVITY FEED" onBack={() => navigate('/')} />
        <Container>
          <div className="flex items-center justify-center py-16" role="status" aria-label="Loading post">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" aria-hidden />
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !post || post.type === 'video') {
    return (
      <div className="bg-black text-white">
        <AppSubpageHeader sticky title="ACTIVITY FEED" onBack={() => navigate('/')} />
        <Container>
          <div className="py-8 text-center">
            <p className="text-muted">{post?.type === 'video' ? 'Opening reel…' : 'Post not found.'}</p>
            {post?.type !== 'video' && (
              <button type="button" onClick={() => navigate('/')} className="text-brand mt-4 underline">
                Back to home
              </button>
            )}
          </div>
        </Container>
      </div>
    );
  }

  const {
    type,
    imageUrl,
    authorName,
    authorAvatarUrl,
    authorId,
    authorIsOfficial,
    title,
    description,
    body,
    backgroundId,
    likesCount,
    commentsCount,
    sharesCount,
    repostsCount,
    liked,
    saved,
    followingCreator,
    media,
    repostOf,
    publishedAt,
  } = post;

  const caption = description || body || '';
  const textBg = type === 'text' ? getFeedTextBackground(backgroundId) : null;
  const mediaSrc = imageUrl || media?.[0]?.url;
  const mediaWidth = media?.[0]?.width || null;
  const mediaHeight = media?.[0]?.height || null;
  const showImage = type === 'image' && Boolean(mediaSrc);
  const isOwnPost = authorId != null && currentUser?.id != null && String(authorId) === String(currentUser.id);
  const showFollow = Boolean(authorId) && !isOwnPost;
  const followBusy = isFollowPending || isUnfollowPending;

  const onFollowClick = () => {
    if (!authorId || followBusy) return;
    if (followingCreator) {
      unfollowCreator(authorId);
    } else {
      followCreator(authorId);
    }
  };

  return (
    <div className="min-h-full bg-black text-white">
      <AppSubpageHeader sticky title="ACTIVITY FEED" />

      <Container className="pb-2">
        <div className="-mx-4 flex flex-col gap-0.5 bg-black">
          <article className="bg-surface overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_20px_40px_-24px_rgba(0,0,0,0.8)]">
            <header className="flex items-center gap-2 px-4 pt-3.5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] p-[2px]">
                  <img
                    src={authorAvatarError || !authorAvatarUrl ? AVATAR_PLACEHOLDER : authorAvatarUrl}
                    alt=""
                    className="border-surface h-11 w-11 rounded-full border-2 object-cover"
                    loading="lazy"
                    onError={() => setAuthorAvatarError(true)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="truncate text-[14px] font-bold text-white">{authorName}</span>
                    <OfficialBadge isOfficial={authorIsOfficial} />
                  </div>
                  <time className="text-muted block text-[11px] leading-tight" dateTime={publishedAt || undefined}>
                    {formattedTimestamp}
                  </time>
                </div>
              </div>
              {showFollow ? (
                <FollowChip following={followingCreator} busy={followBusy} onClick={onFollowClick} name={authorName} />
              ) : null}
            </header>

            {caption && textBg ? (
              <TextPostBackground background={textBg} className="mt-3 min-h-72" rounded={false}>
                <p className={`mx-auto whitespace-pre-wrap ${textBg.textClassName}`}>{caption}</p>
              </TextPostBackground>
            ) : caption ? (
              <p className="max-w-[42ch] px-5 pt-3 text-[15px] leading-[1.6] whitespace-pre-wrap text-white sm:px-6">{caption}</p>
            ) : null}

            {title && type !== 'text' && type !== 'repost' && title !== caption && (
              <h2 className="px-5 pt-1 text-[14px] leading-snug font-bold text-white/80 sm:px-6">{title}</h2>
            )}

            {type === 'repost' && repostOf ? <RepostedPostEmbed post={repostOf} /> : null}

            {showImage && (
              <div className="mt-3 w-full bg-black">
                <img
                  src={imageError ? IMAGE_PLACEHOLDER : mediaSrc}
                  alt=""
                  width={mediaWidth || undefined}
                  height={mediaHeight || undefined}
                  className="block h-auto w-full"
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            <div className="text-muted flex items-center justify-between px-4 pt-3 pb-1 text-[12px]">
              <span className="flex items-center gap-1.5">
                <span className="from-brand to-brand-dark grid h-5 w-5 place-items-center rounded-full bg-linear-to-br">
                  <HeartIcon filled className="h-2.5 w-2.5 text-white" />
                </span>
                <span className="tabular-nums">{formatCount(likesCount)}</span>
              </span>
              <button type="button" onClick={scrollToComments} className="tabular-nums transition-colors hover:text-white">
                {formatCount(commentsCount)} comments · {formatCount(sharesCount)} shares · {formatCount(repostsCount)} reposts
              </button>
            </div>

            <div className="border-border my-1 border-t" />

            <div className="flex items-center gap-0.5 px-1.5 pb-2" role="group" aria-label="Post actions">
              <ActionButton
                active={liked}
                onClick={toggleLike}
                icon={<HeartIcon filled={liked} />}
                ariaLabel={liked ? 'Unlike' : 'Like'}
              />
              <ActionButton onClick={scrollToComments} icon={<CommentIcon />} ariaLabel="Comment" />
              <ActionButton onClick={share} icon={<ShareIcon />} ariaLabel="Share" />
              <ActionButton onClick={repost} icon={<RepostIcon />} ariaLabel="Repost" disabled={isReposting} />
              <ActionButton
                active={saved}
                onClick={toggleSave}
                icon={<BookmarkIcon filled={saved} />}
                ariaLabel={saved ? 'Unsave post' : 'Save post'}
              />
            </div>
          </article>

          <div className="bg-surface px-4 py-4">
            <PostCommentsThread
              postId={postId}
              loginFrom={`/feed/${postId}`}
              stickyComposer={stickyCommentComposer}
              className=""
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
