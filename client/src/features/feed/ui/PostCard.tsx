import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';

import { confirmBlockUser, useFollowUserMutation, useUnfollowUserMutation } from '@/features/explore';

import { UserIdentity, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { shareLink } from '@/shared/native/share';
import { useAppDispatch } from '@/shared/store/hooks';
import { Button } from '@/shared/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/DropdownMenu';
import { BookmarkIcon, CommentIcon, HeartIcon, MoreIcon, PlayFillIcon, RepostIcon, ShareIcon } from '@/shared/ui/icons';
import { MediaFrame } from '@/shared/ui/media';
import { toast } from '@/shared/ui/toast';

import type { Post, PostPhoto } from '../model/schemas';
import { feedRoutes } from '../routes';
import { ReportSheet } from './ReportSheet';

const BACKDROPS = {
  turf: 'bg-post-turf text-white',
  floodlit: 'bg-post-floodlit text-white',
} as const;

type PostCardProps = {
  post: Post;
  isOwn?: boolean;
  onLike?: (() => void) | undefined;
  onComment?: (() => void) | undefined;
  onRepost?: (() => void) | undefined;
  repostBusy?: boolean | undefined;
  onSave?: (() => void) | undefined;
  className?: string | undefined;
};

export function PostCard({
  post,
  isOwn = false,
  onLike,
  onComment,
  onRepost,
  repostBusy = false,
  onSave,
  className,
}: PostCardProps) {
  const dispatch = useAppDispatch();
  const { author, age, body, kind, background, counts, liked, saved } = post;
  const href = kind === 'video' ? feedRoutes.reel(post.id) : feedRoutes.post(post.id);
  const commentsHref = `${href}#comments`;
  const profileHref = userProfilePath({ id: author.id, nickname: author.nickname });
  const [follow, { isLoading: following }] = useFollowUserMutation();
  const [unfollow, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const followBusy = following || unfollowing;
  const [isFollowing, setIsFollowing] = useState(author.following);
  const [reportOpen, setReportOpen] = useState(false);

  async function toggleFollow() {
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) await follow(author.id).unwrap();
      else await unfollow(author.id).unwrap();
    } catch {
      setIsFollowing(!next);
      toast({ title: 'Could Not Update Follow', tone: 'error' });
    }
  }

  async function share() {
    const url = new URL(href, window.location.origin).toString();
    const snippet = body?.trim().slice(0, 120);
    const result = await shareLink({
      title: `${author.name} on Tapeya`,
      url,
      ...(snippet ? { text: snippet } : {}),
    });
    if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
  }

  async function blockAuthor() {
    await confirmBlockUser({
      dispatch,
      userId: author.id,
      userName: author.name ?? 'this user',
    });
  }

  return (
    <article className={cn('border-border-subtle bg-surface overflow-hidden rounded-card border', className)}>
      {kind === 'repost' && post.reposter ? (
        <p className="text-dim flex items-center gap-2 px-3.5 pt-3 text-3xs font-semibold">
          <RepostIcon size="xs" strokeWidth={2} className="h-[13px] w-[13px]" />
          <span>
            <span className="text-body font-bold">{post.reposter.name}</span> reposted
          </span>
        </p>
      ) : null}

      <header className="flex items-center gap-2.5 p-3.5 pb-2.5">
        <UserIdentity
          className="min-w-0 flex-1 items-center"
          user={{ name: author.name, avatarUrl: author.avatarUrl, isOfficial: author.isOfficial }}
          to={profileHref}
          avatarSize="md"
          meta={
            <p className="text-dim font-mono text-4xs font-medium tracking-[.04em] uppercase">
              {age}
              {isOwn ? ' · YOU' : null}
            </p>
          }
        />

        {!isOwn ? (
          <div className="flex shrink-0 items-center gap-1.5">
            {isFollowing ? (
              <Button
                variant="secondary"
                size="sm"
                loading={followBusy}
                aria-pressed
                onClick={() => void toggleFollow()}
              >
                Following
              </Button>
            ) : (
              <Button size="sm" loading={followBusy} aria-pressed={false} onClick={() => void toggleFollow()}>
                Follow
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Post Options"
                className="text-muted hover:bg-surface-raised hover:text-ink grid h-8 w-8 place-items-center rounded-icon"
              >
                <MoreIcon size="sm" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setReportOpen(true)}>Report Post</DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={() => void blockAuthor()}>
                  Block {author.name?.trim() || 'User'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </header>

      {body && kind !== 'text' ? (
        <p className="text-body px-3.5 pb-2.5 text-2xs leading-relaxed whitespace-pre-wrap">{body}</p>
      ) : null}

      {/* Plain text = body only (no box). Styled background_id keeps the centered backdrop. */}
      {kind === 'text' && body ? (
        background ? (
          <Link
            to={href}
            className={cn('grid min-h-[150px] place-items-center px-6 py-6 text-center', BACKDROPS[background])}
          >
            <span className="text-title-sm text-pretty font-bold whitespace-pre-wrap">{body}</span>
          </Link>
        ) : (
          <Link to={href} className="text-body block max-w-[42ch] px-3.5 pb-2.5 text-sm leading-relaxed">
            <span className="text-pretty whitespace-pre-wrap">{body}</span>
          </Link>
        )
      ) : null}

      {kind === 'photos' ? <PhotoGrid photos={post.photos} href={href} /> : null}

      {kind === 'video' && post.poster ? (
        <Link to={href} className="bg-page-deep relative mt-0 block w-full">
          <MediaFrame
            kind="reelPoster"
            src={post.poster}
            alt=""
            rounded="none"
            fade
            className="w-full max-h-[min(72vh,720px)]"
          >
            <span className="pointer-events-none absolute inset-0 m-auto grid h-[52px] w-[52px] place-items-center rounded-full border-[1.5px] border-white/60 bg-black/50">
              <PlayFillIcon size="md" className="h-5 w-5 fill-white" />
            </span>
            {counts.views > 0 ? (
              <span className="font-mono pointer-events-none absolute bottom-3 left-3 flex min-h-[22px] items-center rounded-chip bg-black/55 px-2 text-4xs font-bold text-white">
                {formatEngagement(counts.views)} views
              </span>
            ) : null}
          </MediaFrame>
        </Link>
      ) : null}

      {kind === 'repost' && post.original ? (
        <div className="border-border bg-page-deep mx-3.5 mb-3.5 overflow-hidden rounded-field border">
          <div className="px-3 pt-2.5 pb-2">
            <UserIdentity
              user={{
                name: post.original.author.name,
                avatarUrl: post.original.author.avatarUrl,
                isOfficial: post.original.author.isOfficial,
              }}
              to={userProfilePath({
                id: post.original.author.id,
                nickname: post.original.author.nickname,
              })}
              avatarSize="xs"
              className="gap-2"
              meta={
                <span className="text-dim font-mono block text-4xs font-medium tracking-[.04em] uppercase">
                  {post.original.age}
                </span>
              }
            />
          </div>
          {post.original.body ? (
            <Link
              to={feedRoutes.post(post.original.id)}
              className="text-muted block px-3 pb-2.5 text-2xs leading-relaxed"
            >
              {post.original.body}
            </Link>
          ) : null}
        </div>
      ) : null}

      <footer className="border-border-subtle flex items-center justify-between border-t px-2 py-1">
        <div className="flex items-center gap-0.5" role="group" aria-label="Post Actions">
          <ActionIcon
            active={liked}
            activeClass="text-like"
            onClick={onLike}
            label={liked ? 'Unlike' : 'Like'}
            count={counts.likes}
          >
            <HeartIcon size="sm" strokeWidth={1.9} filled={liked} className="h-[18px] w-[18px]" />
          </ActionIcon>
          <ActionIcon
            onClick={onComment}
            label="Comment"
            href={onComment ? undefined : commentsHref}
            count={counts.comments}
          >
            <CommentIcon size="sm" strokeWidth={1.9} className="h-[18px] w-[18px]" />
          </ActionIcon>
          <ActionIcon onClick={() => void share()} label="Share" count={counts.shares}>
            <ShareIcon size="sm" strokeWidth={1.9} className="h-[18px] w-[18px]" />
          </ActionIcon>
        </div>

        <div className="flex items-center gap-0.5">
          <ActionIcon onClick={onRepost} label="Repost" disabled={repostBusy}>
            <RepostIcon size="sm" strokeWidth={1.9} className="h-[18px] w-[18px]" />
          </ActionIcon>
          <ActionIcon
            active={saved}
            activeClass="text-ink"
            onClick={onSave}
            label={saved ? 'Unsave Post' : 'Save Post'}
          >
            <BookmarkIcon size="sm" strokeWidth={1.9} filled={saved} className="h-[18px] w-[18px]" />
          </ActionIcon>
        </div>
      </footer>

      {!isOwn ? (
        <ReportSheet
          subject={kind === 'video' ? 'reel' : 'post'}
          postId={post.id}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      ) : null}
    </article>
  );
}

function formatEngagement(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function ActionIcon({
  children,
  label,
  count,
  onClick,
  href,
  active,
  activeClass,
  disabled,
}: {
  children: ReactNode;
  label: string;
  count?: number | undefined;
  onClick?: (() => void) | undefined;
  href?: string | undefined;
  active?: boolean | undefined;
  activeClass?: string | undefined;
  disabled?: boolean | undefined;
}) {
  const showCount = typeof count === 'number';
  const classes = cn(
    'text-muted hover:bg-surface-raised hover:text-ink inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-icon transition-colors',
    showCount ? 'min-w-9 px-1.5' : 'w-9',
    active && activeClass,
    disabled && 'pointer-events-none opacity-50'
  );

  const inner = (
    <>
      {children}
      {showCount ? (
        <span className="text-dim min-w-[0.75rem] text-3xs font-semibold tabular-nums">{formatEngagement(count)}</span>
      ) : null}
    </>
  );

  if (href && !onClick) {
    return (
      <Link to={href} aria-label={label} title={label} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active !== undefined ? active : undefined}
      className={classes}
    >
      {inner}
    </button>
  );
}

/** Natural photo aspect — omit img width/height; use `aspectRatio: auto` (DB dims can disagree with file). */
function PhotoGrid({ photos = [], href }: { photos?: PostPhoto[]; href: string }) {
  if (photos.length === 0) return null;

  const shown = photos.slice(0, 4);
  const extra = photos.length - shown.length;

  return (
    <Link
      to={href}
      aria-label={`Post photos, ${photos.length} image${photos.length === 1 ? '' : 's'}`}
      className="block w-full"
    >
      {shown.map((photo, i) => (
        <span key={`${photo.url}-${i}`} className="bg-page-deep relative mt-0 block w-full">
          <img
            src={photo.url}
            alt=""
            className="block h-auto w-full max-w-full"
            style={{ aspectRatio: 'auto' }}
            loading="lazy"
            decoding="async"
          />
          {i === shown.length - 1 && extra > 0 ? (
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-xl font-bold text-white">
              +{extra}
            </span>
          ) : null}
        </span>
      ))}
    </Link>
  );
}
