import { PostCard, ReportSheet } from '@/features/feed';
import { ProfileStats } from '@/features/stats';

import { userHandle } from '@/entities/user';

import { PageDock, ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/DropdownMenu';
import { MoreIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, ProfileHeaderSkeleton, Skeleton } from '@/shared/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { PUBLIC_PROFILE_TABS } from '../lib/publicProfile';
import { ProfileHeader } from './ProfileHeader';
import { ReelGrid } from './ReelGrid';
import type { usePublicProfile } from './usePublicProfile';

type PublicProfileFlow = ReturnType<typeof usePublicProfile>;

type PublicProfileBodyProps = {
  flow: PublicProfileFlow;
};

/** Header, Reels · Posts · Stats shelves, and report sheet. */
export function PublicProfileBody({ flow }: PublicProfileBodyProps) {
  const {
    profile,
    isLoading,
    isError,
    refetch,
    tab,
    selectTab,
    reportOpen,
    setReportOpen,
    reelsPage,
    reelsLoading,
    postsPage,
    postsLoading,
    following,
    unfollowing,
    handleFollowToggle,
    handleShare,
    handleBlock,
    goBack,
  } = flow;

  return (
    <PageDock
      header={
        <ScreenBar
          title="Profile"
          subtitle={profile ? `@${userHandle(profile)}` : 'Player Card'}
          onBack={goBack}
          action={
            profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Profile Options"
                  className="text-muted hover:bg-surface-raised hover:text-ink grid h-8 w-8 place-items-center rounded-icon"
                >
                  <MoreIcon size="sm" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setReportOpen(true)}>Report User</DropdownMenuItem>
                  <DropdownMenuItem destructive onSelect={() => void handleBlock()}>
                    {profile.isBlocked ? 'Unblock' : `Block ${profile.name?.trim() || 'User'}`}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null
          }
        />
      }
    >
      {isLoading ? <ProfileHeaderSkeleton /> : null}

      {isError || (!isLoading && !profile) ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load This Profile" onRetry={() => void refetch()} />
        </div>
      ) : null}

      {profile ? (
        <Tabs value={tab} onValueChange={selectTab} className="flex flex-col">
          <ProfileHeader
            variant="public"
            user={profile}
            isFollowing={profile.isFollowing}
            followLoading={following || unfollowing}
            onFollowToggle={() => void handleFollowToggle()}
            onShare={() => void handleShare()}
          />

          <div className="border-border-subtle border-b px-4">
            <TabsList
              variant="underline"
              className="h-auto w-full justify-start gap-1.5 rounded-none border-0 bg-transparent p-0"
            >
              {PUBLIC_PROFILE_TABS.map(({ value, label }) => (
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

          <TabsContent value="reels" className="mt-0 p-4">
            {reelsLoading ? (
              <div className="grid grid-cols-3 gap-1.5">
                <Skeleton className="aspect-reel-poster rounded-icon" />
                <Skeleton className="aspect-reel-poster rounded-icon" />
                <Skeleton className="aspect-reel-poster rounded-icon" />
              </div>
            ) : reelsPage?.items.length ? (
              <ReelGrid reels={reelsPage.items} />
            ) : (
              <EmptyState title="No Reels Yet" description="This player hasn’t posted a reel." />
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-0">
            {postsLoading ? (
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-24 w-full rounded-card" />
                <Skeleton className="h-24 w-full rounded-card" />
              </div>
            ) : postsPage?.items.length ? (
              <div className="flex flex-col">
                {postsPage.items.map((post) => (
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
                title="No Posts Yet"
                description="When they share a moment, it shows up here."
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-0 px-4 pt-4">
            <ProfileStats userId={profile.id} />
          </TabsContent>
        </Tabs>
      ) : null}

      {profile ? (
        <ReportSheet subject="user" userId={profile.id} open={reportOpen} onOpenChange={setReportOpen} />
      ) : null}
    </PageDock>
  );
}
