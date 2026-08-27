import { Link } from 'react-router-dom';

const CARD_CLASS =
  'relative block w-[112px] shrink-0 snap-start overflow-hidden rounded-[16px] aspect-9/16 bg-surface-deep sm:w-[120px]';

const STRIP_LIMIT = 10;

function ChevronRightIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ReelCard({ reel }) {
  const name = reel.creator?.name || reel.username || reel.handle || 'Reel';
  const handle = reel.handle || (reel.creator?.nickname ? `@${reel.creator.nickname}` : '');
  const showHandle = Boolean(handle) && handle !== name;
  const poster = reel.posterUrl || reel.coverUrl;

  return (
    <Link to={`/reels/${reel.id}`} className={`${CARD_CLASS} group`} aria-label={`Watch reel by ${name}`}>
      {poster ? (
        <img
          src={poster}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-active:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <div className="bg-surface-raised h-full w-full" aria-hidden />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute right-2 bottom-2 left-2">
        <p className="truncate text-[11px] font-semibold text-white sm:text-[12px]">{name}</p>
        {showHandle ? <p className="truncate text-[10px] font-medium text-white/70">{handle}</p> : null}
      </div>
    </Link>
  );
}

function ViewAllCard() {
  return (
    <Link
      to="/reels"
      className={`${CARD_CLASS} border-border flex flex-col items-center justify-center gap-2 border bg-black/40 transition-colors hover:bg-black/55`}
      aria-label="View more reels"
    >
      <span className="bg-surface-raised grid size-10 place-items-center rounded-full text-white">
        <ChevronRightIcon />
      </span>
      <span className="text-[12px] font-bold text-white">View More</span>
    </Link>
  );
}

/**
 * Horizontal Reels discovery widget for the social feed (after compose).
 * Poster gating lives on the API explore scope — this just renders the first N items.
 *
 * @param {{
 *   reels?: Array<object>,
 * }} props
 */
export function FeedReelsWidget({ reels = [] }) {
  const visible = reels.slice(0, STRIP_LIMIT);

  if (visible.length === 0) return null;

  return (
    <section className="bg-surface overflow-hidden py-3.5">
      <header className="mb-3 flex items-center justify-between gap-3 px-4">
        <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase">Reels</h2>
        <Link to="/reels" className="text-brand shrink-0 text-[12px] font-semibold transition-opacity hover:opacity-80">
          View More
        </Link>
      </header>

      <div className="px-4">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-0.5">
          {visible.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}

          <ViewAllCard />
        </div>
      </div>
    </section>
  );
}
