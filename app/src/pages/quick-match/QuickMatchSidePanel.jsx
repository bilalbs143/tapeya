import { useMemo } from 'react';

import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;
const teamEditIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-edit-icon.svg`;
const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;

const actionTileClass =
  'bg-black/40 flex min-w-0 flex-1 basis-0 items-center gap-2.5 rounded-[6px] border border-white/10 px-3 py-3 text-left transition-colors active:bg-white/5';

const actionTileBadgeClass = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full';

const sideIconButtonClass = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-80';

function playerUserId(p) {
  if (p?.user_id != null) return Number(p.user_id);
  if (p?.id != null) return Number(p.id);
  return null;
}

/**
 * Compact VS summary card (Home / Away). Used on create and resume.
 */
export function QuickMatchSideSummaryCard({ name, playerCount, playersPerSide, ariaLabel, onPress }) {
  const target = Number(playersPerSide) > 0 ? Number(playersPerSide) : null;
  const countLabel = target != null ? `${playerCount} / ${target}` : `${playerCount} Players`;
  const displayName = (name ?? '').trim();
  const isSet = Boolean(displayName);

  return (
    <button
      type="button"
      onClick={onPress}
      className="bg-surface flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] p-4 transition-opacity active:opacity-90"
      aria-label={isSet ? `${ariaLabel}: ${displayName}` : `Set ${ariaLabel} Team`}
    >
      <TeamLogo name={displayName || ariaLabel} variant="match" />
      <span className="max-w-full truncate text-center text-[16px] font-bold tracking-wide text-white uppercase">
        {displayName || ariaLabel}
      </span>
      <span className="text-muted text-[13px] font-normal">{isSet ? countLabel : 'Tap to Add Team'}</span>
    </button>
  );
}

/**
 * Squad card for one Quick Match side (shown after the side is set).
 * Find / walk-up open {@link QuickMatchWizardAddPlayerDialog}.
 */
export function QuickMatchSidePanel({
  id,
  label,
  name,
  onClearSide,
  onChangeSide,
  players,
  onAddPlayer,
  onRemovePlayer,
  playersError,
  otherSideUserIds = [],
  playersPerSide,
  canAddPlayers = true,
}) {
  const { openDialog } = useDialog();

  const selectedIds = useMemo(() => players.map(playerUserId).filter((uid) => uid != null), [players]);
  const blockedUserIds = useMemo(() => [...selectedIds, ...otherSideUserIds.map(Number)], [selectedIds, otherSideUserIds]);

  const displayName = name?.trim() || label;
  const targetCount = Number(playersPerSide) > 0 ? Number(playersPerSide) : null;
  const playerCountLabel = targetCount != null ? `${players.length} / ${targetCount}` : String(players.length);
  const fillPct = targetCount ? Math.min(100, Math.round((players.length / targetCount) * 100)) : 0;

  const openAddDialog = (initialMode) => {
    openDialog('quickMatchWizardAddPlayer', {
      sideLabel: displayName,
      blockedUserIds,
      initialMode,
      onAdd: onAddPlayer,
    });
  };

  return (
    <div id={id} className="bg-surface scroll-mt-4 space-y-4 rounded-[17px] border border-[#FFFFFF0F] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <TeamLogo name={displayName} variant="dialogSelect" />
          <h3 className="truncate text-[14px] font-bold tracking-wide text-white uppercase">{displayName}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onChangeSide ? (
            <button type="button" className={sideIconButtonClass} onClick={onChangeSide} aria-label={`Change ${label} Team`}>
              <img src={teamEditIcon} alt="" className="h-4 w-4" />
            </button>
          ) : null}
          {onClearSide ? (
            <button type="button" className={sideIconButtonClass} onClick={onClearSide} aria-label={`Clear ${label} Team`}>
              <img src={teamDeleteIcon} alt="" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-muted text-[12px] font-bold tracking-wide uppercase">Players</p>
          <p className="text-muted text-[12px] font-medium">{playerCountLabel}</p>
        </div>
        {targetCount != null ? (
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="bg-brand h-full rounded-full transition-[width]" style={{ width: `${fillPct}%` }} />
          </div>
        ) : null}
        <ul className="space-y-1">
          {players.map((p, idx) => {
            const uid = playerUserId(p);
            return (
              <li
                key={uid != null ? `u-${uid}` : `w-${p.phone}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-[6px] bg-black/40 px-3 py-2"
              >
                <span className="truncate text-[14px] text-white">{p.name || p.nickname || 'Player'}</span>
                {onRemovePlayer ? (
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80"
                    onClick={() => onRemovePlayer(idx)}
                    aria-label={`Remove ${p.name || p.nickname || 'Player'}`}
                  >
                    <img src={teamDeleteIcon} alt="" className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            );
          })}
          {players.length === 0 ? (
            <li className="text-muted rounded-[6px] bg-black/20 px-3 py-3 text-center text-[13px]">No Players Yet</li>
          ) : null}
        </ul>
        {playersError ? (
          <p className="text-sm text-red-200" role="alert">
            {playersError}
          </p>
        ) : null}

        {canAddPlayers ? (
          <div className="flex gap-2 pt-1">
            <button type="button" className={actionTileClass} onClick={() => openAddDialog('find')}>
              <span className={`${actionTileBadgeClass} bg-white/10`}>
                <img src={searchIcon} alt="" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-white">Find Player</span>
                <span className="text-muted block truncate text-[11px]">On Tapeya</span>
              </span>
            </button>
            <button type="button" className={actionTileClass} onClick={() => openAddDialog('walkup')}>
              <span className={`${actionTileBadgeClass} bg-brand text-ink text-[16px] leading-none font-bold`}>+</span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-white">New Player</span>
                <span className="text-muted block truncate text-[11px]">Walk-Up</span>
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
