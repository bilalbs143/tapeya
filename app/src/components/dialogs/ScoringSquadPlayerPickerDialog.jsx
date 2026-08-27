import { useCallback, useEffect, useMemo, useState } from 'react';

import { PlayerSearchResultRow } from '@/components/PlayerSearchResultRow';
import { ScoringBatsmanPickerRow, ScoringBowlerPickerRow } from '@/components/scoring/ScoringPlayerPickerRows';
import { SquadSetupPlayerRow } from '@/components/scoring/SquadSetupPlayerRow';
import { useDialog } from '@/context/DialogContext';
import { useDebounce } from '@/hooks/useDebounce';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { squadPlayerProfileFields } from '@/lib/utils/playerUtils';
import { useLookupUsersQuery } from '@/store/api/userApi';
import {
  DialogHeaderClose,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { LoaderBlock } from '@/ui/Loader';

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

function SquadPickerSaveFooter({ hideSquadSetup, saving, requiredPlayingCount, squad, onSave }) {
  if (hideSquadSetup) return null;

  const playingCount = squad.filter((p) => p.role === 'playing').length;
  const remaining = requiredPlayingCount - playingCount;
  const isReady = remaining === 0;
  const label = saving ? 'Saving…' : isReady ? 'Save' : `Select ${remaining} more`;

  return (
    <DialogSaveButton disabled={saving || !isReady} loading={saving} onClick={onSave}>
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
  const { data: results = [], isFetching } = useLookupUsersQuery(debouncedQuery, {
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
            <LoaderBlock label="Searching" size="xs" className="px-4 py-3" />
          ) : candidates.length > 0 ? (
            <ul className="py-1">
              {candidates.map((player) => (
                <PlayerSearchResultRow
                  key={player.id}
                  player={player}
                  onClick={() => {
                    onAdd(player);
                    setQuery('');
                  }}
                />
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
  battingStats = [],
  dismissalTypeOptions = [],
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPickBatsman,
  replaceStrikerMode = false,
  strikerId,
  nonStrikerId,
  // bowler-only
  bowlersInTable,
  bowlingStats = [],
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
              <ScoringBatsmanPickerRow
                key={b.id}
                player={b}
                strikerId={strikerId}
                nonStrikerId={nonStrikerId}
                replaceStrikerMode={replaceStrikerMode}
                canAddMoreBatsmen={canAddMoreBatsmen}
                isPlayerBattingOrOut={isPlayerBattingOrOut}
                getBatsmanDisplayStats={getBatsmanDisplayStats}
                battingStats={battingStats}
                dismissalTypeOptions={dismissalTypeOptions}
                onPick={onPickBatsman}
              />
            ) : (
              <ScoringBowlerPickerRow
                key={b.id}
                player={b}
                bowlersInTable={bowlersInTable}
                bowlingStats={bowlingStats}
                replaceActiveBowlerMode={replaceActiveBowlerMode}
                activeBowlerId={activeBowlerId}
                onReplaceActiveBowlerPick={onReplaceActiveBowlerPick}
                onSelectBowlerForNextOver={onSelectBowlerForNextOver}
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
