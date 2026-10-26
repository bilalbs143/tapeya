import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CloseIcon, PlusIcon, SearchIcon } from '@/shared/ui/icons';
import { Skeleton } from '@/shared/ui/states';

import type { DeclareSquadSideKey } from '../lib/declareSquadRoster';
import type { XiPlayer } from '../model/scoringSession';
import { AddQuickMatchPlayerSheet } from './AddQuickMatchPlayerSheet';
import { DeclareSquadPlayerRow } from './DeclareSquadPlayerRow';
import { DeclareSquadSideChip } from './DeclareSquadSideChip';
import { useDeclareSquadScreen } from './useDeclareSquadScreen';

type DeclareSquadScreenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  tournamentId: number | null;
  playersPerSide: number;
  home: { id: number; short: string };
  away: { id: number; short: string };
  battingSide: DeclareSquadSideKey;
  homeXi: XiPlayer[];
  awayXi: XiPlayer[];
};

/** Squad → XI → C/WK. Local draft owns the sheet after seed; do not let refetch clobber mid-edit. */
export function DeclareSquadScreen(props: DeclareSquadScreenProps) {
  const { open, onOpenChange, playersPerSide } = props;
  const {
    isQuick,
    side,
    setSide,
    query,
    setQuery,
    saving,
    walkUpOpen,
    setWalkUpOpen,
    draftReady,
    squads,
    roster,
    candidates,
    exactMatch,
    assignedIds,
    blocker,
    bothValid,
    otherSide,
    otherNeedsLabel,
    short,
    roleLabel,
    addFromPool,
    setPlaying,
    setCaptain,
    setKeeper,
    save,
    addWalkUp,
  } = useDeclareSquadScreen(props);

  return (
    <>
      {/* handle + close in the header — not the peek-height BaseDialog default. */}
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        showClose={false}
        showHandle={false}
        contentClassName={cn(
          // Full-height sheet on phone; re-assert centred card at `tab+` so twMerge
          // does not leave the mobile insets fighting BaseDialog chrome.
          'inset-x-0 top-[max(48px,env(safe-area-inset-top))] bottom-0',
          'tab:top-1/2 tab:left-1/2 tab:right-auto tab:bottom-auto',
          'tab:-translate-x-1/2 tab:-translate-y-1/2 tab:max-h-[min(90dvh,720px)]',
          'flex h-auto max-h-none flex-col overflow-hidden p-0 pb-0 shadow-pop'
        )}
      >
        <DialogHeader className="border-border-subtle shrink-0 border-b pr-5 pb-3">
          <span aria-hidden className="bg-surface-raised mx-auto mb-2 block h-1 w-9.5 rounded-full tab:hidden" />

          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-title-sm leading-normal font-extrabold tracking-tight text-ink">
                Declare Squad
              </DialogTitle>
              <DialogDescription className="font-mono text-dim mt-1 text-3xs font-medium uppercase">
                Both sides before the first ball
              </DialogDescription>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="bg-surface text-body focus-visible:outline-brand grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <CloseIcon className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <DeclareSquadSideChip
              short={short('home')}
              roleLabel={roleLabel('home')}
              roster={squads.home}
              playersPerSide={playersPerSide}
              active={side === 'home'}
              onClick={() => setSide('home')}
            />
            <DeclareSquadSideChip
              short={short('away')}
              roleLabel={roleLabel('away')}
              roster={squads.away}
              playersPerSide={playersPerSide}
              active={side === 'away'}
              onClick={() => setSide('away')}
            />
          </div>

          <div className="border-border-subtle bg-surface focus-within:outline-brand mt-2 flex min-h-10.5 items-center gap-2.5 rounded-full border px-3.5 focus-within:outline-2 focus-within:outline-offset-2">
            <SearchIcon className="text-dim h-4 w-4 shrink-0" strokeWidth={2.1} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or Add a Player"
              aria-label="Search or Add a Player"
              className="placeholder:text-dim h-10 min-w-0 flex-1 bg-transparent text-body-sm font-medium text-ink outline-none"
            />
          </div>
        </DialogHeader>

        {!draftReady ? (
          <DialogBody className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full rounded-field" />
            <Skeleton className="h-14 w-full rounded-field" />
          </DialogBody>
        ) : (
          <>
            <DialogBody className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-0 pb-0">
              {query.trim() ? (
                <div className="border-border-subtle bg-surface mx-4.5 mt-3 shrink-0 divide-y overflow-hidden rounded-2xl border">
                  {candidates.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addFromPool(p)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <Avatar name={p.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-bold text-ink">{p.name}</span>
                        <span className="font-mono text-dim block text-4xs tracking-eyebrow uppercase">
                          {[p.role, p.hand].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="text-brand-text shrink-0 text-2xs font-bold">Add</span>
                    </button>
                  ))}
                  {isQuick && !exactMatch ? (
                    <button
                      type="button"
                      onClick={() => setWalkUpOpen(true)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <span className="bg-page-deep text-dim grid h-8 w-8 shrink-0 place-items-center rounded-full">
                        <PlusIcon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="truncate text-body-sm font-bold text-ink">
                        {query.trim() ? `Add “${query.trim()}”` : 'Add a walk-up'}
                      </span>
                    </button>
                  ) : null}
                  {!candidates.length && !isQuick ? (
                    <p className="text-muted px-3 py-3 text-xs">No matching players on this team’s squad.</p>
                  ) : null}
                </div>
              ) : null}

              {/* List rhythm matches CreaseSetup (Select Batsman): open rows, no bordered card. Play/Bench + C/WK stay on the row — different job. */}
              <div className="flex min-h-0 flex-1 flex-col pt-3.5">
                <div className="font-mono text-dim mb-2.5 flex items-center justify-between px-4.5 text-4xs font-bold tracking-eyebrow uppercase">
                  <span>Playing XI · {short(side)}</span>
                  <span className="font-semibold">Tap a Role to Move It</span>
                </div>

                {roster.length === 0 ? (
                  <p className="text-muted px-4.5 py-10 text-center text-xs leading-normal">
                    Search above to add {short(side)}&apos;s players.
                  </p>
                ) : (
                  <ul className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
                    {roster.map((p) => (
                      <li key={p.id}>
                        <DeclareSquadPlayerRow
                          p={p}
                          onPlaying={setPlaying}
                          onCaptain={setCaptain}
                          onKeeper={setKeeper}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-muted shrink-0 px-5 pt-2 pb-1 text-2xs leading-relaxed">
                {blocker
                  ? `${short(side)} ${blocker.toLowerCase()}.`
                  : bothValid
                    ? 'Both XIs are set — save to open the pad.'
                    : `${short(otherSide)} still needs ${otherNeedsLabel}. You can save ${short(side)} now — the sheet reopens on Add Bowler.`}
              </p>
            </DialogBody>

            <DialogFooter>
              <Button variant="secondary" disabled={saving} onClick={() => setSide(otherSide)}>
                {short(otherSide)} next
              </Button>
              <Button disabled={Boolean(blocker) || saving} loading={saving} onClick={() => void save()}>
                Save Playing XI
              </Button>
            </DialogFooter>
          </>
        )}
      </BaseDialog>

      {isQuick ? (
        <AddQuickMatchPlayerSheet
          open={walkUpOpen}
          sideLabel={short(side)}
          takenIds={[...assignedIds]}
          initialMode={query.trim().length >= 2 ? 'find' : 'new'}
          onOpenChange={setWalkUpOpen}
          onAdd={(player) => {
            void addWalkUp(player);
          }}
        />
      ) : null}
    </>
  );
}
