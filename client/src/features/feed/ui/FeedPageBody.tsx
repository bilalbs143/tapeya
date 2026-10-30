import { exploreRoutes, SuggestedPeopleBand } from '@/features/explore';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, PostSkeleton, SKELETON } from '@/shared/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { FEED_COMPOSER_TABS, FEED_EXPLORE_INSERT, FEED_TABS } from '../lib/feedPage';
import type { FeedTab } from '../model/schemas';
import { feedRoutes } from '../routes';
import { ComposerTrigger } from './ComposerTrigger';
import { HomeDashboard } from './home/HomeDashboard';
import { HomeRail } from './home/HomeRail';
import { EntertainmentRail, HighlightsRail, ProductsRail } from './home/HomeSections';
import { MobileHomeHeader } from './home/MobileHomeHeader';
import { PostCard } from './PostCard';
import { ReelBand, ReelBandSkeleton } from './ReelBand';
import type { useFeedPage } from './useFeedPage';

type FeedPageFlow = ReturnType<typeof useFeedPage>;

type FeedPageBodyProps = {
  flow: FeedPageFlow;
};

function TabEmpty({
  tab,
  onDiscover,
  onCreatePost,
  onCreateReel,
}: {
  tab: FeedTab;
  onDiscover: () => void;
  onCreatePost: () => void;
  onCreateReel: () => void;
}) {
  if (tab === 'following') {
    return (
      <EmptyState
        title="Follow Someone to Fill This"
        description="People you follow show up here, newest first."
        action={
          <Button size="sm" className="w-full max-w-xs" onClick={onDiscover}>
            Suggested for You
          </Button>
        }
      />
    );
  }
  if (tab === 'mine') {
    return (
      <EmptyState
        title="Your Posts Land Here"
        description="Share a moment from the pitch."
        action={
          <div className="flex w-full max-w-xs gap-1.5">
            <Button size="sm" variant="secondary" className="flex-1" onClick={onCreatePost}>
              Create a Post
            </Button>
            <Button size="sm" variant="secondary" className="flex-1" onClick={onCreateReel}>
              Upload a Reel
            </Button>
          </div>
        }
      />
    );
  }
  if (tab === 'saved') {
    return <EmptyState title="Nothing Saved Yet" description="The bookmark on any post keeps it here." />;
  }
  return (
    <EmptyState
      title="Nothing to Show Yet"
      description="Check back in a bit."
      action={
        <Button size="sm" className="w-full max-w-xs" onClick={onDiscover}>
          Refresh
        </Button>
      }
    />
  );
}

/** Home chrome, tab strip, and post column for FeedPage. */
export function FeedPageBody({ flow }: FeedPageBodyProps) {
  const postSkeletonCount = SKELETON.posts;
  const {
    navigate,
    tab,
    selectTab,
    cursor,
    userId,
    me,
    home,
    posts,
    data,
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
  } = flow;

  return (
    <Tabs value={tab} onValueChange={selectTab} className="bg-surface flex min-h-full flex-col">
      <HomeDashboard
        slides={home.slides}
        slidesLoading={home.slidesLoading}
        matches={home.matches}
        streaming={home.streaming}
        liveCount={home.liveCount}
      />
      <MobileHomeHeader
        matches={home.matches}
        streaming={home.streaming}
        slides={home.slides}
        slidesLoading={home.slidesLoading}
      />

      {home.homeError ? (
        <div className="px-4 py-3">
          <ErrorState
            title="Couldn't Load Home Rails"
            description="Live scores, products, highlights, or entertainment failed to load."
            onRetry={() => home.refetchHome()}
          />
        </div>
      ) : null}

      <div className="hidden flex-col gap-3.5 px-4 pt-1 pb-3 tab:flex desk:hidden">
        <HomeRail compact nextMatch={home.nextMatch} />
      </div>

      <div className="border-border-subtle bg-surface sticky top-0 z-20 border-b tab:static">
        <div className="px-4">
          <TabsList
            variant="underline"
            className="h-auto w-full justify-start gap-[22px] overflow-x-auto rounded-none border-0 bg-transparent p-0 pt-3 tab:pt-0"
          >
            {FEED_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={cn(
                  'min-h-0 shrink-0 rounded-none border-b-0 px-0 pt-0 pb-2.5 text-2xs shadow-none tab:pt-2.5',
                  'data-[state=active]:font-extrabold data-[state=active]:text-ink',
                  'data-[state=active]:shadow-[inset_0_-2px_0_var(--color-brand)]',
                  'data-[state=inactive]:text-muted data-[state=inactive]:font-semibold'
                )}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {FEED_TABS.map((t) => (
        <TabsContent key={t.value} value={t.value} className="mt-0 flex flex-col">
          {FEED_COMPOSER_TABS.has(t.value) && me ? (
            <ComposerTrigger user={{ id: me.id, name: me.name, nickname: me.nickname, avatarUrl: me.avatarUrl }} />
          ) : null}

          {refreshing ? (
            <div
              role="status"
              className="text-dim font-mono flex items-center justify-center gap-2 py-2.5 text-4xs font-semibold tracking-[.06em] uppercase"
            >
              <span className="border-brand h-[13px] w-[13px] animate-spin rounded-full border-[1.6px] border-r-transparent" />
              Refreshing
            </div>
          ) : null}

          {t.value === 'explore' && reelsLoading ? <ReelBandSkeleton /> : null}

          {t.value === 'explore' && !reelsLoading && reels?.length ? (
            <div className="border-border-subtle border-b py-3.5">
              <ReelBand reels={reels} />
            </div>
          ) : null}

          {showInitialLoading ? (
            <div className="flex flex-col" aria-busy="true" aria-label="Loading Feed">
              {Array.from({ length: postSkeletonCount }, (_, i) => (
                <PostSkeleton key={i} className="rounded-none border-0 border-b shadow-none" />
              ))}
            </div>
          ) : null}

          {isError && !data ? (
            <div className="p-4">
              <ErrorState
                title="Couldn't Load the Feed"
                description="Connection dropped mid-request."
                onRetry={() => void refetch()}
              />
            </div>
          ) : null}

          {!showInitialLoading && !isError && posts.length === 0 ? (
            <div className="p-4">
              <TabEmpty
                tab={t.value}
                onDiscover={() => navigate(exploreRoutes.discover())}
                onCreatePost={() => navigate(feedRoutes.create())}
                onCreateReel={() => navigate(feedRoutes.createReel())}
              />
            </div>
          ) : null}

          {posts.length > 0 ? (
            <div className="flex flex-col">
              {posts.map((post, i) => (
                <div key={post.id} className="flex flex-col">
                  <PostCard
                    post={post}
                    isOwn={userId != null && post.author.id === userId}
                    className="border-border-subtle rounded-none border-0 border-b shadow-none"
                    onLike={() => void toggleLike(post.id, post.liked)}
                    onComment={() => openComments(post)}
                    onRepost={() => void repost(post.id)}
                    repostBusy={reposting}
                    onSave={() => void toggleSave(post.id, post.saved)}
                  />

                  {t.value === 'explore' && i === FEED_EXPLORE_INSERT.products && home.products.length ? (
                    <div className="border-border-subtle border-b py-3.5">
                      <ProductsRail products={home.products} />
                    </div>
                  ) : null}

                  {t.value === 'explore' && i === FEED_EXPLORE_INSERT.highlights && home.highlights.length ? (
                    <div className="border-border-subtle border-b py-3.5">
                      <HighlightsRail highlights={home.highlights} />
                    </div>
                  ) : null}

                  {t.value === 'explore' && i === FEED_EXPLORE_INSERT.entertainment && home.entertainments.length ? (
                    <div className="border-border-subtle border-b py-3.5">
                      <EntertainmentRail serials={home.entertainments} />
                    </div>
                  ) : null}

                  {t.value === 'explore' && i === FEED_EXPLORE_INSERT.suggestions && suggestions?.length ? (
                    <div className="border-border-subtle border-b py-3.5">
                      <SuggestedPeopleBand users={suggestions} title="Players Near You" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {/* One sentinel on the active tab only — shared ref cannot attach to every TabsContent. */}
          {t.value === tab && canLoadMore ? (
            <div ref={loadMoreRef} className="flex h-10 items-center justify-center" aria-hidden={!isFetching}>
              {isFetching && cursor ? (
                <span role="status" className="text-dim font-mono text-4xs font-semibold tracking-[.06em] uppercase">
                  Loading More…
                </span>
              ) : null}
            </div>
          ) : null}

          {exhausted && posts.length > 0 ? (
            <div className="px-6 py-6 text-center">
              <p className="text-body text-2xs font-bold">You&apos;re all caught up.</p>
              <p className="text-dim mt-0.5 text-3xs leading-normal">Nothing new since you last looked.</p>
            </div>
          ) : null}
        </TabsContent>
      ))}
    </Tabs>
  );
}
