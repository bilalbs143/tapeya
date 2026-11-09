import { Link } from 'react-router-dom';

import { PostCard } from '@/features/feed';

import { APP_PATHS } from '@/shared/config/paths';
import { PageDock } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, PostSkeleton, ReelGridSkeleton, SKELETON } from '@/shared/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { YOU_PROFILE_TABS } from '../lib/youPage';
import { ProfileHeader } from './ProfileHeader';
import { ReelGrid } from './ReelGrid';
import type { useYouPage } from './useYouPage';

type YouFlow = ReturnType<typeof useYouPage>;

type YouPageBodyProps = {
  flow: YouFlow;
};

/** Own header + Reels · Posts · Saved shelves. */
export function YouPageBody({ flow }: YouPageBodyProps) {
  const reelCount = SKELETON.reelGrid;
  const postCount = SKELETON.posts;
  const {
    me,
    tab,
    selectTab,
    reels,
    reelsLoading,
    reelsError,
    refetchReels,
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
  } = flow;

  if (!me) return null;

  // PageDock must sit under a full-height ancestor so `h-full` resolves when the shell is fixed-frame.
  return (
    <Tabs value={tab} onValueChange={selectTab} className="flex h-full min-h-0 flex-col">
      <PageDock
        header={
          <>
            <ProfileHeader variant="own" user={me} onEdit={goEdit} onShare={() => void handleShare()} />
            <div className="border-border-subtle border-b px-4">
              <TabsList
                variant="underline"
                className="h-auto w-full justify-start gap-1.5 rounded-none border-0 bg-transparent p-0"
              >
                {YOU_PROFILE_TABS.map(({ value, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(
                      'min-h-[38px] rounded-none border-b-0 px-2.5 text-2xs leading-normal font-semibold shadow-none',
                      'data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-ink',
                      'data-[state=active]:shadow-[inset_0_-2px_0_var(--color-brand)]',
                      'data-[state=inactive]:text-muted'
                    )}
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </>
        }
      >
        <TabsContent value="reels" className="mt-0 p-4">
          {reelsLoading ? (
            <ReelGridSkeleton count={reelCount} className="gap-1.5 [&>*]:rounded-icon" />
          ) : reelsError ? (
            <ErrorState title="Couldn't Load Reels" onRetry={() => void refetchReels()} />
          ) : reels.length ? (
            <ReelGrid reels={reels} />
          ) : (
            <EmptyState
              title="No Reels Yet"
              description="Your first one takes about a minute."
              action={<Button onClick={goCreateReel}>Upload a Reel</Button>}
            />
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          {postsLoading ? (
            <div className="flex flex-col" aria-busy="true" aria-label="Loading Posts">
              {Array.from({ length: postCount }, (_, i) => (
                <PostSkeleton key={i} className="rounded-none border-0 border-b shadow-none" />
              ))}
            </div>
          ) : postsError ? (
            <div className="px-4 py-8">
              <ErrorState title="Couldn't Load Posts" onRetry={() => void refetchPosts()} />
            </div>
          ) : posts.length ? (
            <div className="flex flex-col">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwn
                  className="border-border-subtle rounded-none border-0 border-b shadow-none"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="px-4 py-10"
              title="No Posts Yet"
              description="Share a cricket moment from Create."
              action={
                <Button asChild>
                  <Link to={APP_PATHS.create}>Create a Post</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          {savedLoading ? (
            <div className="flex flex-col" aria-busy="true" aria-label="Loading Saved">
              {Array.from({ length: postCount }, (_, i) => (
                <PostSkeleton key={i} className="rounded-none border-0 border-b shadow-none" />
              ))}
            </div>
          ) : savedError ? (
            <div className="px-4 py-8">
              <ErrorState title="Couldn't Load Saved" onRetry={() => void refetchSaved()} />
            </div>
          ) : saved.length ? (
            <div className="flex flex-col">
              {saved.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  className="border-border-subtle rounded-none border-0 border-b shadow-none"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="px-4 py-10"
              title="No Saved Yet"
              description="Posts you bookmark collect here. Only you can see this tab."
            />
          )}
        </TabsContent>
      </PageDock>
    </Tabs>
  );
}
