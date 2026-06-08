import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { resolveBatsmanPickerRow, resolveBowlerPickerRow } from '@/lib/utils/playerPickerUtils';

function PickerStatusBadge({ badge }) {
  if (!badge) return null;
  const toneClass =
    badge.tone === 'out'
      ? 'bg-red-500/15 text-red-300'
      : badge.tone === 'active'
        ? 'bg-[#6B7280]/25 text-[#D1D5DB]'
        : 'bg-brand/15 text-brand';
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneClass}`}>{badge.label}</span>;
}

function pickerRowClass(canSelect) {
  return canSelect
    ? 'bg-surface cursor-pointer border border-transparent transition-opacity active:opacity-90 hover:bg-[#282824]'
    : 'bg-surface/40 cursor-not-allowed border border-[#FFFFFF14]';
}

/**
 * Batsman row for in-match picker dialogs.
 */
export function ScoringBatsmanPickerRow({
  player,
  strikerId,
  nonStrikerId,
  replaceStrikerMode = false,
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  battingStats = [],
  dismissalTypeOptions = [],
  onPick,
}) {
  const { canSelect, isUnavailable, statusBadge, scoreLine } = resolveBatsmanPickerRow({
    playerId: player.id,
    strikerId,
    nonStrikerId,
    replaceStrikerMode,
    canAddMoreBatsmen,
    isPlayerBattingOrOut,
    getBatsmanDisplayStats,
    battingStats,
    dismissalTypeOptions,
  });

  return (
    <div
      role="button"
      tabIndex={canSelect ? 0 : -1}
      aria-disabled={!canSelect}
      onClick={() => canSelect && onPick?.(player)}
      onKeyDown={(e) => {
        if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPick?.(player);
        }
      }}
      className={`flex flex-col gap-2 rounded-[10px] px-4 py-3 ${pickerRowClass(canSelect)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[14px] font-bold ${isUnavailable ? 'text-white/70' : 'text-white'}`}>{player.name}</span>
            <PickerStatusBadge badge={statusBadge} />
          </div>
          {!isUnavailable ? <ScoringPlayerPickerMeta player={player} variant="batting" /> : null}
        </div>
        {scoreLine ? <span className="text-muted shrink-0 text-[12px] tabular-nums">{scoreLine}</span> : null}
      </div>
    </div>
  );
}

/**
 * Bowler row for in-match picker dialogs.
 */
export function ScoringBowlerPickerRow({
  player,
  bowlersInTable,
  bowlingStats = [],
  replaceActiveBowlerMode = false,
  activeBowlerId,
  onReplaceActiveBowlerPick,
  onSelectBowlerForNextOver,
}) {
  const { canSelect, statusBadge, statsLine } = resolveBowlerPickerRow({
    playerId: player.id,
    bowlersInTable,
    bowlingStats,
    replaceActiveBowlerMode,
    activeBowlerId,
  });

  const handlePick = () => {
    if (!canSelect) return;
    if (replaceActiveBowlerMode) {
      onReplaceActiveBowlerPick?.(player);
    } else {
      onSelectBowlerForNextOver?.(player);
    }
  };

  return (
    <div
      role="button"
      tabIndex={canSelect ? 0 : -1}
      aria-disabled={!canSelect}
      onClick={handlePick}
      onKeyDown={(e) => {
        if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handlePick();
        }
      }}
      className={`flex flex-col gap-2 rounded-[10px] px-4 py-3 ${pickerRowClass(canSelect)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[14px] font-bold ${canSelect ? 'text-white' : 'text-white/70'}`}>{player.name}</span>
            <PickerStatusBadge badge={statusBadge} />
          </div>
          <ScoringPlayerPickerMeta player={player} variant="bowling" />
        </div>
        {statsLine ? <span className="text-muted shrink-0 text-[12px] tabular-nums">{statsLine}</span> : null}
      </div>
    </div>
  );
}
