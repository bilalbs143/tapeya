import { Link } from 'react-router-dom';

import type { HomeHeroSlide, HomeLiveMatch, HomeStream } from '@/features/feed/model/homeSchemas';
import { liveRoutes } from '@/features/live';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import { HomeHeroCarousel } from './HomeHeroCarousel';

type HomeDashboardProps = {
  slides?: HomeHeroSlide[] | undefined;
  slidesLoading?: boolean | undefined;
  matches?: HomeLiveMatch[] | undefined;
  streaming?: HomeStream[] | undefined;
  liveCount?: number | undefined;
};

/** Desktop home centre — hero carousel, live scores, streams. */
export function HomeDashboard({
  slides = [],
  slidesLoading = false,
  matches = [],
  streaming = [],
  liveCount,
}: HomeDashboardProps) {
  const featured = matches[0] ?? null;
  const otherLive = matches.slice(1);
  const liveLabel = liveCount ?? Math.max(matches.length, 0);
  const streamForHero = featured ? streaming.find((s) => s.matchId === featured.id) : null;
  const showHero = slidesLoading || slides.length > 0;

  if (!featured && !otherLive.length && !streaming.length && !showHero) {
    return null;
  }

  return (
    <div className="hidden flex-col tab:flex">
      {showHero ? (
        <div className="pt-1 pb-1">
          <HomeHeroCarousel slides={slides} loading={slidesLoading} />
        </div>
      ) : null}

      {featured ? (
        <div className="px-4 pt-1">
          <LiveHero match={featured} viewers={streamForHero?.viewers} />
        </div>
      ) : null}

      {otherLive.length ? (
        <section className="border-border-subtle bg-surface mx-4 mt-3 overflow-hidden rounded-card border">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="font-mono text-danger-text flex items-center gap-1.5 text-4xs font-bold tracking-eyebrow uppercase">
              <span className="bg-danger-text h-1.5 w-1.5 rounded-full" />
              Also Live · {liveLabel} Matches
            </span>
            <Link to={APP_PATHS.matches} className="text-brand-text ml-auto text-2xs leading-normal font-semibold">
              See All
            </Link>
          </div>
          <div
            className={cn(
              'border-border-subtle bg-border-subtle grid gap-px border-t',
              otherLive.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
            )}
          >
            {otherLive.slice(0, 2).map((m) => (
              <LiveMatchTile key={m.id} match={m} />
            ))}
          </div>
        </section>
      ) : null}

      {streaming.length ? (
        <section className="border-border-subtle bg-surface mx-4 mt-3 overflow-hidden rounded-card border">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="font-mono text-dim flex items-center gap-1.5 text-4xs font-bold tracking-eyebrow uppercase">
              <span className="bg-danger-text h-1.5 w-1.5 rounded-full" />
              Streaming Now
            </span>
            <Link to={APP_PATHS.live} className="text-brand-text ml-auto text-2xs leading-normal font-semibold">
              All Streams
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {streaming.slice(0, 2).map((s) => (
              <Link key={s.id} to={liveRoutes.broadcast(s.id)} className="group" aria-label={s.title}>
                <span className="bg-brand-deep relative block aspect-video overflow-hidden rounded-panel">
                  {s.cover ? (
                    <img
                      src={s.cover}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center px-3 text-center text-2xs leading-normal font-bold tracking-wide text-white/45 uppercase">
                      {s.creator}
                    </span>
                  )}
                  <LiveBadge variant="media" viewers={s.viewers} className="absolute top-2 left-2" />
                  {s.score ? (
                    <span className="font-mono absolute right-2.5 bottom-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-4xs font-bold text-white backdrop-blur-[8px]">
                      {s.score}
                    </span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mb-1" />
    </div>
  );
}

function oversLabel(o: string | null | undefined): string {
  if (o == null || o === '') return '';
  return ` (${String(o).replace(/\.0$/, '')})`;
}

function liveFoot(match: HomeLiveMatch): string | null {
  const chase = match.chase;
  const need = chase != null ? Math.max(0, chase.target - chase.runs) : null;
  if (match.batting === 'away' && need != null && chase?.ballsLeft != null) {
    return `${match.away.name} need ${need} off ${chase.ballsLeft}`;
  }
  if (match.batting === 'home' && need != null && chase?.ballsLeft != null) {
    return `${match.home.name} need ${need} off ${chase.ballsLeft}`;
  }
  if (!match.awayScore) {
    return `1st innings · ${match.ballsLeftLabel || 'in progress'}`;
  }
  return null;
}

function LiveHero({ match, viewers }: { match: HomeLiveMatch; viewers?: string | null | undefined }) {
  const href = APP_PATHS.matches;
  const battingAway = match.batting === 'away';
  const line = battingAway
    ? [match.awayScore || match.score, match.awayOvers || match.overs].filter(Boolean).join(' · ')
    : [match.homeScore || match.score, match.homeOvers || match.overs].filter(Boolean).join(' · ');
  const foot = liveFoot(match);

  return (
    <div className="border-border-subtle relative overflow-hidden rounded-sheet border bg-[linear-gradient(105deg,var(--color-brand-deep)_0%,var(--color-brand)_62%,var(--color-brand-hover)_100%)]">
      <div className="bg-stripe-soft pointer-events-none absolute top-0 right-0 bottom-0 w-[55%] [clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-[58%] bg-[linear-gradient(90deg,var(--color-brand-deep)_0%,color-mix(in_oklab,var(--color-brand-deep)_55%,transparent)_42%,transparent_100%)]" />

      <div className="relative flex flex-col justify-end p-6 pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <LiveBadge variant="media" viewers={viewers} />
          <span className="font-mono text-4xs font-bold tracking-[.12em] text-white/70 uppercase">
            {match.label || match.tournamentShort || match.format}
          </span>
        </div>

        <h2 className="mt-3 text-title leading-snug font-extrabold tracking-tight text-pretty text-white">
          {match.home.name} vs
          <br />
          {match.away.name}
        </h2>

        {line ? (
          <p className="font-mono text-display-sm mt-3 leading-normal font-extrabold tracking-tight text-white tabular-nums">
            {line}
          </p>
        ) : null}

        {foot ? <p className="text-positive-light mt-1.5 text-body-sm font-semibold">{foot}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button asChild className="h-10 rounded-field px-4 text-body-sm font-bold">
            <Link to={href}>Watch Live</Link>
          </Button>
          <Button
            variant="secondary"
            asChild
            className="h-10 rounded-field border-white/20 bg-white/12 px-4 text-body-sm font-semibold text-white hover:bg-white/18"
          >
            <Link to={href}>Scorecard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function LiveMatchTile({ match }: { match: HomeLiveMatch }) {
  const foot = liveFoot(match);

  return (
    <Link to={APP_PATHS.matches} className="bg-surface hover:bg-surface-raised block px-4 py-3.5">
      <p className="font-mono text-dim text-4xs font-semibold tracking-[.04em] uppercase">
        {match.label || match.tournamentShort || match.format}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-body min-w-0 truncate text-body-sm font-bold">{match.home.name}</span>
        <span className="font-mono text-body shrink-0 text-body-sm font-bold tabular-nums">
          {match.homeScore || '—'}
          {match.homeOvers ? <span className="text-muted font-semibold">{oversLabel(match.homeOvers)}</span> : null}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-body-sm font-bold text-ink">{match.away.name}</span>
        <span className="font-mono text-muted shrink-0 text-body-sm font-semibold tabular-nums">
          {match.awayScore ? (
            <>
              {match.awayScore}
              {match.awayOvers ? <span className="font-semibold">{oversLabel(match.awayOvers)}</span> : null}
            </>
          ) : (
            'yet to bat'
          )}
        </span>
      </div>
      {foot ? <p className="text-positive mt-2 truncate text-2xs leading-normal font-semibold">{foot}</p> : null}
    </Link>
  );
}
