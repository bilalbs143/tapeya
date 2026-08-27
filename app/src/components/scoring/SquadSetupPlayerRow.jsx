import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { Button } from '@/ui/Button';

/**
 * Declare / change squad player card — all actions inline, no popover.
 *
 * Actions row: [C toggle] [WK toggle] [Playing] [Bench]  [× remove]
 */
export function SquadSetupPlayerRow({
  player,
  isCaptain,
  isWicketKeeper,
  isPlaying,
  onSetRole,
  onSetCaptain,
  onSetWicketKeeper,
  onRemove,
}) {
  const pid = player.id;

  return (
    <div className="border-border-subtle bg-surface rounded-[10px] border px-3 py-3">
      {/* Name + meta */}
      <div className="min-w-0">
        <span className="text-[14px] font-bold text-white">{player.name}</span>
        <ScoringPlayerPickerMeta player={player} variant="batting" />
      </div>

      {/* Inline actions */}
      <div className="mt-2.5 flex items-center gap-1.5">
        {/* Captain toggle */}
        <button
          type="button"
          aria-label={isCaptain ? 'Remove as Captain' : 'Make Captain'}
          aria-pressed={isCaptain}
          onClick={() => onSetCaptain?.(pid)}
          className={`focus-visible:ring-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
            isCaptain ? 'bg-brand text-black' : 'bg-surface-raised text-muted hover:text-white'
          }`}
        >
          C
        </button>

        {/* Wicket keeper toggle */}
        <button
          type="button"
          aria-label={isWicketKeeper ? 'Remove as Wicket Keeper' : 'Set as Wicket Keeper'}
          aria-pressed={isWicketKeeper}
          onClick={() => onSetWicketKeeper?.(pid)}
          className={`focus-visible:ring-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
            isWicketKeeper ? 'bg-brand text-black' : 'bg-surface-raised text-muted hover:text-white'
          }`}
        >
          WK
        </button>

        {/* Playing / Bench */}
        <Button
          type="button"
          size="sm"
          variant={isPlaying ? 'orange' : 'dark'}
          aria-pressed={isPlaying}
          onClick={() => onSetRole(pid, 'playing')}
          className="text-[11px] font-bold"
        >
          Playing
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!isPlaying ? 'orange' : 'dark'}
          aria-pressed={!isPlaying}
          onClick={() => onSetRole(pid, 'bench')}
          className="text-[11px] font-bold"
        >
          Bench
        </Button>

        {/* Remove — pushed to far right */}
        {onRemove ? (
          <button
            type="button"
            aria-label={`Remove ${player.name} from squad`}
            onClick={() => onRemove(pid)}
            className="bg-surface-raised ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default SquadSetupPlayerRow;
