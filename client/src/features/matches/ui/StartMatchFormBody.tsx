import { teamCrest, type Tournament, type TournamentTeam } from '@/features/tournaments';

import { BaseDialog, DialogBody, DialogDescription, DialogHeader, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { NumberStepper } from '@/shared/ui/NumberStepper';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import {
  START_MATCH_OVERS_MAX,
  START_MATCH_OVERS_MIN,
  START_MATCH_PLAYERS_MAX,
  START_MATCH_PLAYERS_MIN,
  START_MATCH_THUMB_ACCEPT,
  type StartMatchGroupKey,
  type StartMatchPickSlot,
} from '../lib/startMatchForm';
import type { useStartMatchForm } from './useStartMatchForm';

type StartMatchFormFlow = ReturnType<typeof useStartMatchForm>;

type StartMatchFormBodyProps = {
  flow: StartMatchFormFlow;
};

/** Sticky actions — page owns DockScreen. */
export function StartMatchFormFooter({ flow }: StartMatchFormBodyProps) {
  const { ready, busy, submit } = flow;

  return (
    <StickyActionBar>
      <div className="flex w-full flex-col gap-2.5">
        <Button
          variant="positive"
          className="w-full font-bold"
          disabled={!ready || Boolean(busy)}
          loading={busy === 'start'}
          onClick={() => void submit('start')}
        >
          Start Match
        </Button>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            className="shrink-0 px-4 font-bold"
            disabled={!ready || Boolean(busy)}
            loading={busy === 'save'}
            onClick={() => void submit('save')}
          >
            Save Fixture
          </Button>
          <p className="text-muted min-w-0 flex-1 text-3xs leading-[1.45]">
            <span className="text-ink font-bold">Start Match</span> opens the toss now.{' '}
            <span className="text-ink font-bold">Save Fixture</span> files it for later.
          </p>
        </div>
      </div>
    </StickyActionBar>
  );
}

/** Fixture form and pick dialogs for StartMatchPage. */
export function StartMatchFormBody({ flow }: StartMatchFormBodyProps) {
  const {
    tournaments,
    selected,
    tournamentId,
    teams,
    teamsLoading,
    teamsError,
    refetchTeams,
    numberOfGroups,
    hasGroups,
    matchGroupKey,
    matchGroupIndex,
    setMatchGroup,
    home,
    away,
    resolvedHomeId,
    resolvedAwayId,
    venue,
    setVenueOverride,
    date,
    setDate,
    time,
    setTime,
    overs,
    setOvers,
    players,
    setPlayers,
    thumbPreview,
    thumbInput,
    pickThumb,
    pickSlot,
    setPickSlot,
    pickTournament,
    setPickTournament,
    selectTournament,
    pickTeam,
    openTournamentPicker,
  } = flow;

  return (
    <>
      <Form density="compact" className="flex flex-col px-4 pt-4 pb-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="Tournament" required>
          <button
            type="button"
            onClick={openTournamentPicker}
            className="border-border bg-surface flex min-h-12 w-full items-center gap-2.5 rounded-field border px-3.5 text-left"
          >
            <span className="min-w-0 flex-1 truncate text-body-sm leading-normal font-bold text-ink">
              {selected?.name ?? 'Pick Tournament'}
            </span>
            <span className="text-muted text-body-lg leading-normal font-semibold" aria-hidden>
              ›
            </span>
          </button>
        </Field>

        {hasGroups ? (
          <Field label="Match Type" required hint="Group fixtures only list teams attached to that group.">
            {() => (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Match Type">
                <Chip
                  selected={matchGroupKey === 'knockout'}
                  onClick={() => setMatchGroup('knockout')}
                  role="radio"
                  aria-checked={matchGroupKey === 'knockout'}
                >
                  Knockout / Playoff
                </Chip>
                {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((idx) => {
                  const key = String(idx) as StartMatchGroupKey;
                  return (
                    <Chip
                      key={idx}
                      selected={matchGroupKey === key}
                      onClick={() => setMatchGroup(key)}
                      role="radio"
                      aria-checked={matchGroupKey === key}
                    >
                      Group {idx}
                    </Chip>
                  );
                })}
              </div>
            )}
          </Field>
        ) : null}

        <Field
          label="Teams"
          required
          hint={
            !tournamentId
              ? 'Pick a tournament first.'
              : teams.length < 2 && !teamsLoading && !teamsError
                ? hasGroups && matchGroupIndex != null
                  ? 'This group needs at least two teams before you can start a fixture.'
                  : 'This tournament needs at least two teams before you can start a fixture.'
                : undefined
          }
        >
          <div className="flex items-center gap-2.5">
            <SideSlot team={home} placeholder="Pick Side A" onClick={() => setPickSlot('home')} />
            <span className="font-mono text-muted text-[10px] font-extrabold">VS</span>
            <SideSlot team={away} placeholder="Pick Side B" dashed={!away} onClick={() => setPickSlot('away')} />
          </div>
          {teamsError ? (
            <div className="mt-2">
              <ErrorState title="Couldn’t Load Teams" onRetry={() => void refetchTeams()} />
            </div>
          ) : teamsLoading ? (
            <Skeleton className="mt-2 h-10 w-full rounded-field" aria-label="Loading Teams" />
          ) : null}
        </Field>

        <div className="flex gap-2.5">
          <div className="min-w-0 flex-[1.4]">
            <Input
              label="Venue"
              value={venue}
              onChange={(e) => setVenueOverride(e.target.value)}
              className="min-h-12 rounded-field"
              autoComplete="off"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Field label="Date & time">
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  days="any"
                  value={date}
                  onChange={setDate}
                  placeholder="Date"
                  className="min-h-12 rounded-field"
                />
                <Input
                  type="time"
                  aria-label="Time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="min-h-12 rounded-field"
                />
              </div>
            </Field>
          </div>
        </div>

        <Field label="Overs" required>
          <NumberStepper
            value={overs}
            min={START_MATCH_OVERS_MIN}
            max={START_MATCH_OVERS_MAX}
            onChange={setOvers}
            decreaseLabel="Decrease Overs"
            increaseLabel="Increase Overs"
          />
        </Field>

        <Field label="Players Per Side" required>
          <NumberStepper
            value={players}
            min={START_MATCH_PLAYERS_MIN}
            max={START_MATCH_PLAYERS_MAX}
            onChange={setPlayers}
            decreaseLabel="Decrease Players"
            increaseLabel="Increase Players"
          />
        </Field>

        <Field label="Stream Thumbnail" hint="Optional. JPG, PNG, or WebP · max 5 MB. Shown on the Live hub.">
          {() => (
            <>
              <button
                type="button"
                onClick={() => thumbInput.current?.click()}
                className="border-border text-muted flex h-12 w-full items-center justify-center gap-2 rounded-field border border-dashed text-xs font-semibold"
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="" className="h-8 w-14 rounded object-cover" />
                ) : (
                  <span aria-hidden>+</span>
                )}
                {thumbPreview ? 'Replace Thumbnail' : 'Add Thumbnail'}
              </button>
              <input
                ref={thumbInput}
                type="file"
                accept={START_MATCH_THUMB_ACCEPT}
                className="hidden"
                onChange={pickThumb}
              />
            </>
          )}
        </Field>

        <div className="border-border bg-surface rounded-field border px-3.5 py-3">
          <p className="text-muted text-[11px] leading-[1.55]">
            Overs and players per side set the bowling quota and the all-out rule for the whole match. The scoring pad
            reads them — they can&apos;t be edited after the first ball.
          </p>
        </div>
      </Form>

      <TeamPickDialog
        open={Boolean(pickSlot)}
        pickSlot={pickSlot}
        tournamentName={selected?.name ?? 'Tournament'}
        teams={teams}
        resolvedHomeId={resolvedHomeId}
        resolvedAwayId={resolvedAwayId}
        onClose={() => setPickSlot(null)}
        onPick={pickTeam}
      />

      <TournamentPickDialog
        open={pickTournament}
        tournaments={tournaments}
        tournamentId={tournamentId}
        onOpenChange={setPickTournament}
        onSelect={selectTournament}
      />
    </>
  );
}

function SideSlot({
  team,
  placeholder,
  dashed,
  onClick,
}: {
  team: TournamentTeam | null;
  placeholder: string;
  dashed?: boolean | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-border bg-surface flex min-h-[72px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-field border px-2 py-2 text-center',
        dashed && 'border-dashed'
      )}
    >
      {team ? (
        <>
          <span className="bg-brand/15 text-brand-text flex h-9 w-9 items-center justify-center rounded-icon text-3xs font-extrabold">
            {teamCrest(team)}
          </span>
          <span className="w-full truncate text-2xs font-bold text-ink">{team.name}</span>
        </>
      ) : (
        <span className="text-muted text-2xs font-semibold">{placeholder}</span>
      )}
    </button>
  );
}

function TeamPickDialog({
  open,
  pickSlot,
  tournamentName,
  teams,
  resolvedHomeId,
  resolvedAwayId,
  onClose,
  onPick,
}: {
  open: boolean;
  pickSlot: StartMatchPickSlot;
  tournamentName: string;
  teams: TournamentTeam[];
  resolvedHomeId: number | null;
  resolvedAwayId: number | null;
  onClose: () => void;
  onPick: (teamId: number) => void;
}) {
  return (
    <BaseDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogHeader>
        <DialogTitle>{pickSlot === 'home' ? 'Pick Side A' : 'Pick Side B'}</DialogTitle>
        <DialogDescription>{tournamentName}. Pick a team for this fixture.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="border-border max-h-[50vh] divide-y overflow-y-auto rounded-panel border">
          {teams.map((team) => {
            const taken =
              (team.id === resolvedHomeId || team.id === resolvedAwayId) &&
              !(pickSlot === 'home' && team.id === resolvedHomeId) &&
              !(pickSlot === 'away' && team.id === resolvedAwayId);
            return (
              <button
                key={team.id}
                type="button"
                disabled={taken}
                onClick={() => onPick(team.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left disabled:opacity-40"
              >
                <span className="bg-brand/15 text-brand-text flex h-10 w-10 shrink-0 items-center justify-center rounded-icon text-2xs font-extrabold">
                  {teamCrest(team)}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">{team.name}</span>
              </button>
            );
          })}
        </div>
      </DialogBody>
    </BaseDialog>
  );
}

function TournamentPickDialog({
  open,
  tournaments,
  tournamentId,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  tournaments: Tournament[];
  tournamentId: number | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: Tournament) => void;
}) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Tournament</DialogTitle>
        <DialogDescription>Fixtures land on the tournament you pick here.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="border-border max-h-[50vh] divide-y overflow-y-auto rounded-panel border">
          {tournaments.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelect(row)}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-3 text-left',
                row.id === tournamentId && 'bg-brand/10'
              )}
            >
              <span className="min-w-0 flex-1 truncate text-body-sm leading-normal font-bold text-ink">{row.name}</span>
              {row.id === tournamentId ? (
                <span className="font-mono text-brand-text text-4xs leading-normal font-bold tracking-[.1em] uppercase">
                  Current
                </span>
              ) : (
                <span className="text-muted text-body-lg leading-normal" aria-hidden>
                  ›
                </span>
              )}
            </button>
          ))}
        </div>
      </DialogBody>
    </BaseDialog>
  );
}
