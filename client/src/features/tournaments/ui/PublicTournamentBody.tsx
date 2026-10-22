import { Link } from 'react-router-dom';

import { interestRoutes } from '@/features/interest';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ChevronLeftIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/shared/ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { PUBLIC_TOURNAMENT_TABS, type PublicTournamentTab } from '../lib/publicTournament';
import type { Tournament } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';
import { PublicTournamentLiveTab } from './PublicTournamentLiveTab';
import { PublicTournamentStatsTab } from './PublicTournamentStatsTab';
import { PublicTournamentTableTab } from './PublicTournamentTableTab';
import { TournamentFixturesPanel } from './TournamentFixturesPanel';
import { TournamentSquadsPanel, TournamentTeamsPanel } from './TournamentTeamsPanel';
import { usePublicTournament } from './usePublicTournament';

type PublicTournamentBodyProps = {
  tournament: Tournament;
};

function ReactionPill({
  on,
  onClick,
  label,
  kind,
  tone,
  disabled,
  ariaLabel,
}: {
  on: boolean;
  onClick: () => void;
  label: number;
  kind: 'like' | 'dislike';
  tone?: 'positive';
  disabled?: boolean;
  ariaLabel: string;
}) {
  const ThumbIcon = kind === 'like' ? ThumbsUpIcon : ThumbsDownIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={on}
      className={cn(
        'border-border-subtle bg-surface inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-2xs font-semibold disabled:opacity-60',
        on && tone === 'positive' ? 'text-positive-2' : on ? 'text-ink' : 'text-body'
      )}
    >
      <ThumbIcon
        className={cn('h-[13px] w-[13px]', on && tone === 'positive' ? 'text-positive-2' : 'text-current')}
        strokeWidth={2}
        filled={on}
      />
      {label}
    </button>
  );
}

/** Hero, reactions, and Live · Schedule · Table · Teams · Squads · Stats. */
export function PublicTournamentBody({ tournament }: PublicTournamentBodyProps) {
  const flow = usePublicTournament(tournament);
  const {
    navigate,
    tab,
    teamParam,
    setTab,
    likes,
    dislikes,
    shares,
    myReaction,
    reacting,
    handleLike,
    handleDislike,
    handleShare,
    place,
    counts,
    interestSlug,
  } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <div className="relative h-[196px] shrink-0 overflow-hidden bg-[repeating-linear-gradient(135deg,var(--c-surface-raised),var(--c-surface-raised)_8px,var(--c-page)_8px,var(--c-page)_16px)]">
        {tournament.coverImage ? (
          <img src={tournament.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="text-dim font-mono absolute inset-0 grid place-items-center text-4xs font-semibold tracking-eyebrow uppercase">
            Hero Cover
          </span>
        )}
        <div className="from-page pointer-events-none absolute inset-x-0 bottom-0 h-[90px] bg-linear-to-t to-transparent" />
        <div className="absolute inset-x-3.5 top-[max(14px,env(safe-area-inset-top))] z-10 flex items-center justify-between">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="border-border-subtle bg-veil grid h-[34px] w-[34px] place-items-center rounded-full border backdrop-blur-[10px]"
          >
            <ChevronLeftIcon className="text-ink h-4 w-4" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-label="Share"
            onClick={() => void handleShare()}
            className="border-border-subtle bg-veil grid h-[34px] w-[34px] place-items-center rounded-full border backdrop-blur-[10px]"
          >
            <ShareIcon className="text-ink h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg leading-tight font-extrabold text-ink">{tournament.name}</h1>
          <p className="font-mono text-body text-2xs font-medium">{place}</p>
          {counts ? <p className="text-dim font-mono text-3xs font-medium">{counts}</p> : null}
          {tournament.prize ? <p className="text-muted text-2xs font-semibold">Prize · {tournament.prize}</p> : null}
          {tournament.champion ? (
            <p className="text-positive-2 text-2xs font-bold">Champions · {tournament.champion}</p>
          ) : null}
        </div>

        {interestSlug ? (
          <Button asChild variant="primary" className="h-12 w-full rounded-field text-body-sm font-bold">
            <Link to={interestRoutes.form(interestSlug)}>I&apos;m Interested</Link>
          </Button>
        ) : null}

        {tournament.canManage ? (
          <Button asChild variant="secondary" size="sm" className="w-full font-semibold">
            <Link to={tournamentRoutes.detail(tournament.id)}>Open Workspace</Link>
          </Button>
        ) : null}

        <div className="flex items-center gap-2">
          <ReactionPill
            on={myReaction === 'like'}
            tone="positive"
            disabled={reacting}
            onClick={() => void handleLike()}
            label={likes}
            ariaLabel={`Like. ${likes} likes`}
            kind="like"
          />
          <ReactionPill
            on={myReaction === 'dislike'}
            disabled={reacting}
            onClick={() => void handleDislike()}
            label={dislikes}
            ariaLabel={`Dislike. ${dislikes} dislikes`}
            kind="dislike"
          />
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={reacting}
            className="border-border-subtle bg-surface text-body ml-auto inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-2xs font-semibold disabled:opacity-60"
          >
            <ShareIcon className="h-[13px] w-[13px]" strokeWidth={2} />
            Share{shares > 0 ? ` · ${shares}` : ''}
          </button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as PublicTournamentTab)} className="flex min-h-0 flex-col pb-6">
        <div className="border-border-subtle border-b px-4">
          <TabsList
            variant="underline"
            className="no-scrollbar w-full justify-start gap-0 overflow-x-auto rounded-none border-0 bg-transparent p-0"
          >
            {PUBLIC_TOURNAMENT_TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:shadow-[inset_0_-2px_0_var(--color-brand)] text-dim data-[state=active]:text-ink shrink-0 rounded-none border-b-0 px-3 pb-2.5 text-2xs font-semibold data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:font-bold"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="live" className="mt-0 px-4 pt-3.5">
          <PublicTournamentLiveTab tournamentId={tournament.id} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-0 px-4 pt-3.5">
          <TournamentFixturesPanel tournamentId={tournament.id} groupCount={tournament.groupCount} />
        </TabsContent>
        <TabsContent value="table" className="mt-0 px-4 pt-3.5">
          <PublicTournamentTableTab tournamentId={tournament.id} />
        </TabsContent>
        <TabsContent value="teams" className="mt-0 px-4 pt-3.5">
          <TournamentTeamsPanel tournamentId={tournament.id} onOpenSquad={(teamId) => setTab('squads', teamId)} />
        </TabsContent>
        <TabsContent value="squads" className="mt-0 px-4 pt-3.5">
          <TournamentSquadsPanel
            tournamentId={tournament.id}
            teamParam={teamParam}
            onSelect={(teamId) => setTab('squads', teamId)}
          />
        </TabsContent>
        <TabsContent value="stats" className="mt-0 px-4 pt-3.5">
          <PublicTournamentStatsTab tournamentId={tournament.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
