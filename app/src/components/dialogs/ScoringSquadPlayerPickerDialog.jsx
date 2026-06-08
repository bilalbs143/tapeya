import { useCallback, useEffect, useMemo, useState } from 'react';

import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { SquadSetupPlayerRow } from '@/components/scoring/SquadSetupPlayerRow';
import { useDialog } from '@/context/DialogContext';
import { useDebounce } from '@/hooks/useDebounce';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { squadPlayerProfileFields } from '@/lib/utils/playerUtils';
import { useSearchSquadMembersQuery } from '@/store/api/playerApi';
import { Button } from '@/ui/Button';
import {
  DialogHeaderClose,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';

// ─── Helpers ────────────────────────────────────────────────────────────────

const toStr = (v) => (v == null ? '' : String(v));

// ─── Nav icons ───────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PlayingBenchRoleToggle({ playerId, role, onSetRole }) {
  return (
    <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        size="sm"
        variant={role === 'playing' ? 'orange' : 'black'}
        aria-pressed={role === 'playing'}
        aria-label="Set as Playing"
        onClick={() => onSetRole(playerId, 'playing')}
        className="text-[12px] font-bold uppercase"
      >
        Playing
      </Button>
      <Button
        type="button"
        size="sm"
        variant={role === 'bench' ? 'orange' : 'black'}
        aria-pressed={role === 'bench'}
        aria-label="Set as Bench"
        onClick={() => onSetRole(playerId, 'bench')}
        className="text-[12px] font-bold uppercase"
      >
        Bench
      </Button>
    </div>
  );
}

function SquadPickerSaveFooter({ hideSquadSetup, saving, requiredPlayingCount, squad, onSave }) {
  if (hideSquadSetup) return null;

  const playingCount = squad.filter((p) => p.role === 'playing').length;
  const remaining = requiredPlayingCount - playingCount;
  const isReady = remaining === 0;
  const label = saving ? 'Saving…' : isReady ? 'Save' : `Select ${remaining} more`;

  return (
    <DialogSaveButton disabled={saving || !isReady} onClick={onSave}>
      {label}
    </DialogSaveButton>
  );
}

/**
 * Inline search — typing opens a dropdown of API results to add to the squad.
 * Matches the TournamentSquad page pattern exactly (same input style, same dropdown).
 * The squad list below is never filtered.
 */
function AddPlayerSearch({ squadIds, onAdd }) {
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const debouncedQuery = useDebounce(trimmed, DEBOUNCE_MS);
  const { data: results = [], isFetching } = useSearchSquadMembersQuery(debouncedQuery, {
    skip: debouncedQuery.length < MIN_SEARCH_LENGTH,
  });

  const candidates = useMemo(() => results.filter((p) => p.id != null && !squadIds.has(String(p.id))), [results, squadIds]);

  const showDropdown = trimmed.length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by Name, Nickname, or Phone…"
        autoComplete="off"
        className="bg-surface placeholder:text-muted/47 focus:ring-brand/50 h-12 w-full rounded-[6px] py-3 pr-10 pl-4 text-white focus:ring-2 focus:outline-none"
        aria-label="Find Player"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="text-muted absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors hover:text-white active:opacity-80"
          aria-label="Clear Search"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      {showDropdown && (
        <div className="bg-surface absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] shadow-lg">
          {trimmed.length < MIN_SEARCH_LENGTH ? (
            <p className="text-muted px-4 py-3 text-[13px]">Type at least {MIN_SEARCH_LENGTH} characters to search</p>
          ) : isFetching ? (
            <p className="text-muted px-4 py-3 text-[13px]">Searching…</p>
          ) : candidates.length > 0 ? (
            <ul className="py-1">
              {candidates.map((player) => (
                <li key={player.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(player);
                      setQuery('');
                    }}
                    className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
                  >
                    <span className="font-semibold text-white">{player.name ?? player.nickname ?? '—'}</span>
                    {(player.playing_role ?? player.playing_role_enum) && (
                      <span className="text-muted text-[13px]">{player.playing_role ?? player.playing_role_enum}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted px-4 py-3 text-[13px]">
              {results.length > 0
                ? 'All matching players are already in the squad.'
                : 'No players found. Try a different search.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BatsmanSquadPickerRow({
  b,
  ballHistory,
  hideSquadSetup,
  squadEditOnly = false,
  replaceStrikerMode,
  strikerId,
  nonStrikerId,
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPickBatsman,
  onSetRole,
}) {
  const sid = toStr(b.id);

  const isCurrentStriker = replaceStrikerMode && sid === toStr(strikerId);
  const isNonStrikerOnCrease = replaceStrikerMode && nonStrikerId != null && sid === toStr(nonStrikerId);
  const dismissed = replaceStrikerMode && ballHistory.some((ball) => ball.type === 'out' && toStr(ball.striker?.id) === sid);

  const hasBattingStats = replaceStrikerMode ? isCurrentStriker || isNonStrikerOnCrease || dismissed : isPlayerBattingOrOut(b.id);

  const isEligible = hideSquadSetup || b.role === 'playing';
  const canAdd = !squadEditOnly && !hasBattingStats && isEligible && (replaceStrikerMode || canAddMoreBatsmen);

  const stats = getBatsmanDisplayStats(b.id);

  return (
    <div
      role="button"
      tabIndex={canAdd ? 0 : -1}
      aria-disabled={!canAdd}
      onClick={() => canAdd && onPickBatsman(b)}
      onKeyDown={(e) => {
        if (canAdd && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPickBatsman(b);
        }
      }}
      className={`bg-surface flex flex-col gap-2 rounded-[10px] px-4 py-3 ${
        canAdd ? 'cursor-pointer transition-opacity active:opacity-90' : ''
      } ${hasBattingStats ? 'cursor-not-allowed opacity-90' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[14px] font-bold text-white">{b.name}</span>
          <ScoringPlayerPickerMeta player={b} variant="batting" />
        </div>
        {hasBattingStats && stats ? (
          <div className="text-muted flex shrink-0 gap-4 text-[12px]">
            <span>R: {stats.runs}</span>
            <span>B: {stats.balls}</span>
            <span>4s: {stats.fours}</span>
            <span>6s: {stats.sixes}</span>
            <span>SR: {stats.strikeRate}</span>
          </div>
        ) : hideSquadSetup ? null : (
          <PlayingBenchRoleToggle playerId={b.id} role={b.role} onSetRole={onSetRole} />
        )}
      </div>
    </div>
  );
}

function BowlerSquadPickerRow({
  b,
  hideSquadSetup,
  squadEditOnly = false,
  bowlersInTable,
  replaceActiveBowlerMode,
  activeBowlerId,
  onReplaceActiveBowlerPick,
  onSelectBowlerForNextOver,
  onSetRole,
}) {
  const sid = toStr(b.id);
  const table = bowlersInTable ?? [];
  const inTable = table.some((bt) => toStr(bt.id) === sid);
  const isActiveBowler = replaceActiveBowlerMode && sid === toStr(activeBowlerId);
  const isEligible = hideSquadSetup || b.role === 'playing';

  const canSelect = squadEditOnly
    ? false
    : replaceActiveBowlerMode
      ? isEligible && !isActiveBowler
      : inTable || (isEligible && !inTable);

  const handlePick = () => {
    if (!canSelect) return;
    if (replaceActiveBowlerMode) {
      onReplaceActiveBowlerPick?.(b);
    } else {
      onSelectBowlerForNextOver(b);
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
      className={`bg-surface flex flex-col gap-2 rounded-[10px] px-4 py-3 ${
        canSelect ? 'cursor-pointer transition-opacity active:opacity-90' : 'cursor-default'
      } ${replaceActiveBowlerMode && isActiveBowler ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[14px] font-bold text-white">{b.name}</span>
          <ScoringPlayerPickerMeta player={b} variant="bowling" />
        </div>
        {hideSquadSetup ? null : <PlayingBenchRoleToggle playerId={b.id} role={b.role} onSetRole={onSetRole} />}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ScoringSquadPlayerPickerDialog({
  variant,
  players: initialPlayers,
  initialCaptainId = null,
  initialWicketKeeperId = null,
  hideSquadSetup = false,
  squadEditOnly = false,
  declareSquadMode = false,
  teamName,
  requiredPlayingCount,
  onSaveSquad,
  onSetRole,
  squadFlowStep = null,
  squadFlowTotal = null,
  onSquadFlowBack,
  onSquadFlowNext,
  onAddPlayerToSquad,
  onRemovePlayerFromSquad,
  // batsman-only
  ballHistory = [],
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPickBatsman,
  replaceStrikerMode = false,
  strikerId,
  nonStrikerId,
  // bowler-only
  bowlersInTable,
  onSelectBowlerForNextOver,
  replaceActiveBowlerMode = false,
  activeBowlerId,
  onReplaceActiveBowlerPick,
}) {
  const { closeDialog } = useDialog();
  const [players, setPlayers] = useState(initialPlayers ?? []);
  const [saving, setSaving] = useState(false);
  const [captainId, setCaptainId] = useState(initialCaptainId ?? null);
  const [wicketKeeperId, setWicketKeeperId] = useState(initialWicketKeeperId ?? null);

  const showSquadSetupChrome = !hideSquadSetup && !replaceStrikerMode && !replaceActiveBowlerMode;

  useEffect(() => {
    setPlayers(initialPlayers ?? []);
  }, [initialPlayers]);

  const squadIds = useMemo(() => new Set(players.map((p) => String(p.id))), [players]);
  const playingCount = players.filter((p) => p.role === 'playing').length;

  const handleSetRole = useCallback(
    (playerId, role) => {
      setPlayers((prev) => prev.map((p) => (String(p.id) === String(playerId) ? { ...p, role } : p)));
      onSetRole?.(playerId, role);
    },
    [onSetRole],
  );

  const handleAddPlayer = useCallback(
    (player) => {
      if (!player?.id || squadIds.has(String(player.id))) return;
      const row = {
        ...squadPlayerProfileFields(player),
        id: player.id,
        name: player.name ?? player.nickname ?? `Player ${player.id}`,
        role: 'bench',
      };
      setPlayers((prev) => [...prev, row]);
      onAddPlayerToSquad?.(row);
    },
    [onAddPlayerToSquad, squadIds],
  );

  const handleRemovePlayer = useCallback(
    (playerId) => {
      setPlayers((prev) => prev.filter((p) => String(p.id) !== String(playerId)));
      onRemovePlayerFromSquad?.(playerId);
      if (String(captainId) === String(playerId)) setCaptainId(null);
    },
    [onRemovePlayerFromSquad, captainId],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSquad?.(players, captainId, wicketKeeperId);
      closeDialog();
      onSquadFlowNext?.();
    } finally {
      setSaving(false);
    }
  };

  const title = squadEditOnly
    ? 'Change Squad'
    : declareSquadMode
      ? 'Declare Squad'
      : variant === 'batsman'
        ? replaceStrikerMode
          ? 'Replace Striker'
          : 'Select Batsman'
        : replaceActiveBowlerMode
          ? 'Replace Bowler'
          : 'Select Bowler';

  const isBatsman = variant === 'batsman';
  const showSquadFlowFooter = showSquadSetupChrome && (onSquadFlowBack || onSquadFlowNext);

  const navButtonClass = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-ink';

  return (
    <>
      <DialogHeaderRow closeSlot={<DialogHeaderClose aria-label="Close" />}>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      {teamName ? <p className="text-brand px-5 pb-1 text-[13px] font-semibold">{teamName}</p> : null}

      {showSquadSetupChrome ? (
        <div className="space-y-3 px-5 pb-3">
          <p className="text-brand text-[13px] font-bold">
            {players.length}/{requiredPlayingCount} Players
            <span className="text-muted ml-2 font-medium">({playingCount} in XI)</span>
          </p>
          {onAddPlayerToSquad ? <AddPlayerSearch squadIds={squadIds} onAdd={handleAddPlayer} /> : null}
        </div>
      ) : null}

      <DialogScrollBody className={showSquadFlowFooter ? '!pb-2' : ''}>
        <FormStack density="compact">
          {players.length === 0 && <p className="text-muted py-6 text-center text-sm">No players available</p>}

          {players.map((b) =>
            showSquadSetupChrome ? (
              <SquadSetupPlayerRow
                key={b.id}
                player={b}
                isCaptain={captainId != null && String(captainId) === String(b.id)}
                isWicketKeeper={wicketKeeperId != null && String(wicketKeeperId) === String(b.id)}
                isPlaying={b.role === 'playing'}
                onSetRole={handleSetRole}
                onSetCaptain={setCaptainId}
                onSetWicketKeeper={setWicketKeeperId}
                onRemove={onRemovePlayerFromSquad ? handleRemovePlayer : null}
              />
            ) : isBatsman ? (
              <BatsmanSquadPickerRow
                key={b.id}
                b={b}
                ballHistory={ballHistory}
                hideSquadSetup={hideSquadSetup}
                squadEditOnly={squadEditOnly}
                replaceStrikerMode={replaceStrikerMode}
                strikerId={strikerId}
                nonStrikerId={nonStrikerId}
                canAddMoreBatsmen={canAddMoreBatsmen}
                isPlayerBattingOrOut={isPlayerBattingOrOut}
                getBatsmanDisplayStats={getBatsmanDisplayStats}
                onPickBatsman={onPickBatsman}
                onSetRole={handleSetRole}
              />
            ) : (
              <BowlerSquadPickerRow
                key={b.id}
                b={b}
                hideSquadSetup={hideSquadSetup}
                squadEditOnly={squadEditOnly}
                bowlersInTable={bowlersInTable}
                replaceActiveBowlerMode={replaceActiveBowlerMode}
                activeBowlerId={activeBowlerId}
                onReplaceActiveBowlerPick={onReplaceActiveBowlerPick}
                onSelectBowlerForNextOver={onSelectBowlerForNextOver}
                onSetRole={handleSetRole}
              />
            ),
          )}
        </FormStack>
      </DialogScrollBody>

      {showSquadFlowFooter ? (
        <div className="flex shrink-0 items-center justify-between px-5 py-2">
          {onSquadFlowBack ? (
            <button type="button" aria-label="Previous Squad Step" onClick={onSquadFlowBack} className={navButtonClass}>
              <ChevronLeft />
            </button>
          ) : (
            <span className="w-8" />
          )}
          {squadFlowStep != null && squadFlowTotal != null ? (
            <span className="text-muted text-[11px] leading-none font-medium">
              Step {squadFlowStep} of {squadFlowTotal}
            </span>
          ) : null}
          {onSquadFlowNext && squadFlowStep != null && squadFlowStep < squadFlowTotal ? (
            <button
              type="button"
              aria-label="Next Squad Step"
              disabled={playingCount !== requiredPlayingCount || saving}
              onClick={handleSave}
              className={`${navButtonClass} disabled:opacity-40`}
            >
              <ChevronRight />
            </button>
          ) : (
            <span className="w-8" />
          )}
        </div>
      ) : null}

      <SquadPickerSaveFooter
        hideSquadSetup={hideSquadSetup}
        saving={saving}
        requiredPlayingCount={requiredPlayingCount}
        squad={players}
        onSave={handleSave}
      />
    </>
  );
}
