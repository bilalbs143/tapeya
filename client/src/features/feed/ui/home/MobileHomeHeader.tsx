import { Link } from 'react-router-dom';

import { HOME_EXPLORE_TILES } from '@/features/feed/lib/homeExploreTiles';
import type { HomeHeroSlide, HomeLiveMatch, HomeStream } from '@/features/feed/model/homeSchemas';
import { liveRoutes } from '@/features/live';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { BallChip } from '@/shared/ui/BallChip';
import { HScroll } from '@/shared/ui/HScroll';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import { HomeHeroCarousel } from './HomeHeroCarousel';

type MobileHomeHeaderProps = {
  matches?: HomeLiveMatch[] | undefined;
  streaming?: HomeStream[] | undefined;
  slides?: HomeHeroSlide[] | undefined;
  slidesLoading?: boolean | undefined;
};

/** Mobile home chrome — hero, explore tiles, live scores, live now. */
export function MobileHomeHeader({
  matches = [],
  streaming = [],
  slides = [],
  slidesLoading = false,
}: MobileHomeHeaderProps) {
  const liveCount = matches.length;
  const showHero = slidesLoading || slides.length > 0;

  return (
    <div className="bg-surface flex flex-col tab:hidden">
      {showHero ? (
        <div className="pt-1.5 pb-1">
          <HomeHeroCarousel slides={slides} loading={slidesLoading} />
        </div>
      ) : null}

      <div className="pt-1.5 pb-4">
        <p className="text-navy-text font-mono px-4 pb-2.5 text-4xs font-bold tracking-eyebrow uppercase">Explore</p>
        <div className="grid grid-cols-5 gap-2 px-4">
          {HOME_EXPLORE_TILES.map((item) => (
            <Link key={item.label} to={item.href} className="flex min-w-0 flex-col items-center text-center">
              <span className="border-border-subtle bg-surface grid aspect-square w-full max-w-14 place-items-center rounded-card border">
                <item.icon className="text-body h-5 w-5" />
              </span>
              <span className="text-ink mt-1.5 line-clamp-2 w-full text-4xs font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {matches.length ? (
        <div className="pb-4">
          <div className="flex items-center justify-between px-4 pb-2.5">
            <p className="font-mono flex items-center gap-1.5 text-4xs font-bold tracking-eyebrow text-ink uppercase">
              <span className="relative grid h-2.5 w-2.5 place-items-center">
                <span className="bg-danger absolute inset-0 rounded-full opacity-75" />
                <span className="bg-danger-text relative h-1.5 w-1.5 rounded-full" />
              </span>
              Live Score · {liveCount}
            </p>
            <Link to={APP_PATHS.matches} className="text-brand-text text-2xs font-semibold">
              View More <span className="text-body-sm font-bold">›</span>
            </Link>
          </div>
          <HScroll bleed={false} className="gap-2.5">
            {matches.map((m) => (
              <LiveScoreCard key={m.id} match={m} />
            ))}
          </HScroll>
        </div>
      ) : null}

      {streaming.length ? (
        <div className="pb-4">
          <div className="flex items-center justify-between px-4 pb-2.5">
            <p className="font-mono flex items-center gap-1.5 text-4xs font-bold tracking-eyebrow text-ink uppercase">
              <span className="bg-danger-text h-1.5 w-1.5 rounded-full" />
              Live Now
            </p>
            <Link to={APP_PATHS.live} className="text-brand-text text-2xs font-semibold">
              View More <span className="text-body-sm font-bold">›</span>
            </Link>
          </div>
          <HScroll bleed={false} className="gap-2.5">
            {streaming.map((s) => (
              <LiveNowCard key={s.id} stream={s} />
            ))}
          </HScroll>
        </div>
      ) : null}
    </div>
  );
}

function LiveScoreCard({ match }: { match: HomeLiveMatch }) {
  const homeActive = match.batting === 'home';
  const awayActive = match.batting === 'away';
  const chaseNeed = match.chase ? Math.max(0, match.chase.target - match.chase.runs) : null;
  const progress = match.chase ? Math.min(100, Math.round((match.chase.runs / match.chase.target) * 100)) : null;

  return (
    <Link
      to={APP_PATHS.matches}
      className="border-border-subtle bg-surface w-64 shrink-0 rounded-card border px-3.5 py-3.5"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-navy-text font-mono text-4xs font-semibold tracking-[.1em] uppercase">
          {match.label || `${match.format ?? 'Live'} · ${match.venue ?? ''}`}
        </span>
        <LiveBadge />
      </div>

      <ScoreLine name={match.home.name} score={match.homeScore} overs={match.homeOvers} active={homeActive} />
      <ScoreLine
        name={match.away.name}
        score={match.awayScore ?? (awayActive ? match.score : null)}
        overs={match.awayOvers ?? (awayActive ? match.overs : null)}
        active={awayActive}
        yetToBat={!awayActive && !match.awayScore}
        className="mb-3"
      />

      {match.chase ? (
        <>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-dim font-mono text-4xs font-bold tracking-[.12em] uppercase">Chase</span>
            <span className="text-positive-2 text-2xs font-semibold">
              {chaseNeed} off {match.chase.ballsLeft}{' '}
              {match.chase.rrr ? <span className="text-muted font-normal">· rrr {match.chase.rrr}</span> : null}
            </span>
          </div>
          <div className="border-border-subtle bg-page-deep h-1.5 overflow-hidden rounded-full border">
            <div className="bg-positive h-full" style={progress != null ? { width: `${progress}%` } : undefined} />
          </div>
        </>
      ) : (
        <p className="text-dim text-2xs font-semibold">
          1st innings
          {match.ballsLeftLabel || match.rr ? (
            <span> · {match.ballsLeftLabel || (match.rr ? `rr ${match.rr}` : null)}</span>
          ) : null}
        </p>
      )}

      {match.over.length ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="text-dim font-mono text-4xs font-bold tracking-[.1em] uppercase">OV {match.overNum}</span>
          <span className="flex gap-1">
            {match.over.slice(0, 6).map((b, i) => (
              <BallChip key={`${match.id}-${i}`} value={b} className="h-5 w-5 text-4xs leading-normal" />
            ))}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

function ScoreLine({
  name,
  score,
  overs,
  active,
  yetToBat,
  className,
}: {
  name: string;
  score: string | null;
  overs: string | null;
  active: boolean;
  yetToBat?: boolean | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn('mb-1 flex items-baseline justify-between gap-2', className)}>
      <span className={cn('truncate text-body-sm', active ? 'font-bold text-ink' : 'text-muted font-semibold')}>
        {name}
      </span>
      <span
        className={cn(
          'font-mono shrink-0',
          active ? 'text-base font-bold text-ink' : 'text-sm leading-normal font-bold text-muted'
        )}
      >
        {yetToBat ? (
          <span className="text-dim text-2xs font-semibold">yet to bat</span>
        ) : (
          <>
            {score}{' '}
            {overs ? (
              <span className={cn('text-4xs font-normal', active ? 'text-muted' : 'text-dim')}>{overs}</span>
            ) : null}
          </>
        )}
      </span>
    </div>
  );
}

function LiveNowCard({ stream }: { stream: HomeStream }) {
  return (
    <Link to={liveRoutes.broadcast(stream.id)} className="w-52 shrink-0" aria-label={stream.title}>
      <div className="bg-brand-deep relative h-32 overflow-hidden rounded-card">
        {stream.cover ? (
          <img
            src={stream.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center px-3 text-center text-2xs font-bold tracking-wide text-white/45 uppercase">
            {stream.creator}
          </span>
        )}
        <LiveBadge variant="media" viewers={stream.viewers} className="absolute top-2 left-2" />
      </div>
    </Link>
  );
}
