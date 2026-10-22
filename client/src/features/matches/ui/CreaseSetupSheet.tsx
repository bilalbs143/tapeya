import { useMemo, useState } from 'react';

import { BaseDialog, DialogDescription, DialogFooter, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CheckIcon, InfoIcon } from '@/shared/ui/icons';
import { SearchBar } from '@/shared/ui/SearchBar';

import type { CreasePlayer, XiPlayer } from '../model/scoringSession';

export type CreaseNeeds = 'openers' | 'batter' | 'bowler';

type CreaseSetupSheetProps = {
  open: boolean;
  needs: CreaseNeeds;
  batters: XiPlayer[];
  bowlers: XiPlayer[];
  battingShort: string;
  bowlingShort: string;
  oversPerSide: number | null;
  /** Survivor at the crease when replacing a batter. */
  stays?: CreasePlayer | null | undefined;
  staysOnStrike?: boolean | undefined;
  dismissible?: boolean | undefined;
  saving: boolean;
  onDismiss?: (() => void) | undefined;
  onSave: (patch: { nextBatterId?: number; nextNonStrikerId?: number; nextBowlerId?: number }) => void;
};

type PickSlot = 'striker' | 'nonStriker' | 'bowler';

/** Squad search, on-strike / non-striker slot chips, Pick badges. Remount via `key` on open/needs so pick state resets without an effect. */

export function CreaseSetupSheet({
  open,
  needs,
  batters,
  bowlers,
  battingShort,
  bowlingShort,
  oversPerSide,
  stays = null,
  staysOnStrike = false,
  dismissible = false,
  saving,
  onDismiss,
  onSave,
}: CreaseSetupSheetProps) {
  const [strikerId, setStrikerId] = useState<number | null>(null);
  const [nonStrikerId, setNonStrikerId] = useState<number | null>(null);
  const [bowlerId, setBowlerId] = useState<number | null>(null);
  const [slot, setSlot] = useState<PickSlot>(needs === 'bowler' ? 'bowler' : 'striker');
  const [query, setQuery] = useState('');

  const maxBowlerOvers = Math.max(1, Math.floor((oversPerSide ?? 20) / 5));
  const squad = needs === 'bowler' ? bowlers : batters;
  const availableCount = squad.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return squad;
    return squad.filter((p) => p.name.toLowerCase().includes(q));
  }, [squad, query]);

  const striker = batters.find((p) => p.id === strikerId) ?? null;
  const nonStriker = batters.find((p) => p.id === nonStrikerId) ?? null;
  const bowler = bowlers.find((p) => p.id === bowlerId) ?? null;

  const valid =
    needs === 'openers'
      ? strikerId != null && nonStrikerId != null && strikerId !== nonStrikerId
      : needs === 'batter'
        ? strikerId != null
        : bowlerId != null;

  const title = needs === 'openers' ? 'Select Batsman' : needs === 'batter' ? 'Replace Batsman' : 'Select Bowler';

  const subtitle =
    needs === 'batter'
      ? `${battingShort} · Replace at the crease`
      : needs === 'bowler'
        ? `${bowlingShort} · Max ${maxBowlerOvers} overs per bowler`
        : `${battingShort} · ${availableCount} in playing XI`;

  const ctaLabel = (() => {
    if (needs === 'openers') {
      if (strikerId == null && nonStrikerId == null) return 'Pick Both Openers';
      if (strikerId == null || nonStrikerId == null) return 'Pick One More Batter';
      return 'Confirm Openers';
    }
    if (needs === 'bowler') return 'Start the Over';
    return 'Back to the Pad';
  })();

  function pick(player: XiPlayer) {
    if (needs === 'bowler') {
      setBowlerId(player.id);
      return;
    }
    if (needs === 'batter') {
      setStrikerId(player.id);
      return;
    }
    if (slot === 'striker') {
      setStrikerId(player.id);
      if (nonStrikerId == null) setSlot('nonStriker');
    } else {
      setNonStrikerId(player.id);
      if (strikerId == null) setSlot('striker');
    }
  }

  function submit() {
    if (!valid) return;
    if (needs === 'openers' && strikerId != null && nonStrikerId != null) {
      onSave({ nextBatterId: strikerId, nextNonStrikerId: nonStrikerId });
      return;
    }
    if (needs === 'batter' && strikerId != null) {
      onSave({ nextBatterId: strikerId });
      return;
    }
    if (needs === 'bowler' && bowlerId != null) {
      onSave({ nextBowlerId: bowlerId });
    }
  }

  const emptyXi = squad.length === 0;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && dismissible) onDismiss?.();
      }}
      sheet
      showClose={dismissible}
      dismissible={dismissible}
      contentClassName="flex max-h-[88vh] flex-col gap-0 p-0"
    >
      <div className="border-border-subtle shrink-0 border-b px-5 pt-2 pb-3.5">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="font-mono text-dim mt-1 text-3xs font-medium uppercase">
          {subtitle}
        </DialogDescription>

        {needs === 'batter' ? (
          <div className="mt-3.5 flex gap-2.5">
            <div
              className={cn(
                'flex min-h-14.5 flex-1 flex-col justify-center rounded-panel border border-dashed px-2.5 py-2',
                striker ? 'border-brand bg-brand/10' : 'border-brand bg-surface'
              )}
            >
              <p className="font-mono text-brand-text mb-0.5 text-4xs font-bold tracking-eyebrow uppercase">
                New Batter · On Strike
              </p>
              <p className={cn('truncate text-xs font-semibold', striker ? 'text-ink font-bold' : 'text-dim')}>
                {striker?.name || 'Tap a Name Below'}
              </p>
            </div>
            {stays ? (
              <div className="border-border-subtle bg-surface flex min-h-14.5 flex-1 flex-col justify-center rounded-panel border px-2.5 py-2">
                <p className="font-mono text-dim mb-0.5 text-4xs font-bold tracking-eyebrow uppercase">
                  Stays · {staysOnStrike ? 'On Strike' : 'Non-Striker'}
                </p>
                <p className="truncate text-xs font-bold text-ink">
                  {stays.name}{' '}
                  <span className="font-mono text-dim text-3xs font-semibold">
                    {stays.runs}({stays.balls})
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {needs === 'openers' ? (
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <SlotButton
              label="On Strike"
              name={striker?.name ?? null}
              active={slot === 'striker'}
              onClick={() => setSlot('striker')}
            />
            <SlotButton
              label="Non-Striker"
              name={nonStriker?.name ?? null}
              active={slot === 'nonStriker'}
              onClick={() => setSlot('nonStriker')}
            />
          </div>
        ) : null}

        {needs === 'bowler' && bowler ? (
          <div className="border-brand bg-brand/10 mt-3.5 flex min-h-14.5 items-center gap-2.5 rounded-panel border px-3">
            <Avatar name={bowler.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-brand-text text-4xs font-bold tracking-eyebrow uppercase">Bowling</p>
              <p className="truncate text-body-sm font-bold text-ink">{bowler.name}</p>
              <p className="font-mono text-dim text-3xs font-medium uppercase">0 of {maxBowlerOvers} overs</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-2">
        <div className="px-4.5">
          <SearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search the Squad"
            label="Search the Squad"
            size="sm"
          />
        </div>

        <div className="font-mono text-dim flex items-center justify-between px-4.5 pt-3 text-4xs font-bold tracking-eyebrow uppercase">
          <span>
            {needs === 'bowler' ? 'Fielding Squad' : needs === 'batter' ? 'Yet to Bat' : 'Batting Order · Squad'}
          </span>
          <span className="font-semibold">
            {needs === 'bowler' ? `Max ${maxBowlerOvers} overs` : `${availableCount} available`}
          </span>
        </div>

        {emptyXi ? (
          <p className="text-body px-4.5 py-6 text-sm" role="alert">
            Playing XI is empty. Save the toss on a quick match, or declare the XI, before scoring.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-muted px-4.5 py-6 text-center text-xs">No one in the squad matches that.</p>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
            {filtered.map((p) => {
              const takenAs =
                strikerId === p.id
                  ? 'Striker'
                  : nonStrikerId === p.id
                    ? 'Non-Striker'
                    : bowlerId === p.id
                      ? 'Bowling'
                      : null;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    className="focus-visible:outline-brand flex min-h-15 w-full items-center gap-2.5 rounded-field px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Avatar name={p.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-ink">{p.name}</span>
                      <span className="text-dim font-mono block text-4xs uppercase">
                        {needs === 'bowler' ? `0 of ${maxBowlerOvers} overs` : 'In XI'}
                      </span>
                    </span>
                    {takenAs ? (
                      <span className="bg-brand inline-flex shrink-0 items-center gap-1 rounded-icon px-2.5 py-1.5 text-2xs font-bold text-white">
                        <CheckIcon size="xs" className="h-2.5 w-2.5" strokeWidth={3.5} />
                        {takenAs}
                      </span>
                    ) : (
                      <span className="bg-brand inline-flex h-8.5 shrink-0 items-center rounded-icon px-3 text-2xs font-bold text-white">
                        Pick
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {needs === 'batter' ? (
        <div className="text-muted mx-4.5 mb-1 flex gap-2 rounded-field px-3 py-3 text-2xs leading-relaxed">
          <InfoIcon size="xs" className="text-dim mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>
            If the wicket fell on the last ball of the over, Select Bowler follows this sheet automatically — two
            prompts, never two dead ends.
          </span>
        </div>
      ) : null}

      {needs === 'bowler' ? (
        <p className="text-dim mx-4.5 mb-1 text-2xs leading-relaxed">
          Pick from the fielding XI. Back-to-back overs and spell limits follow when the scorebook tracks them.
        </p>
      ) : null}

      <DialogFooter>
        <Button
          size="md"
          variant={needs === 'bowler' || needs === 'batter' ? 'positive' : 'primary'}
          disabled={!valid || emptyXi}
          loading={saving}
          onClick={submit}
        >
          {ctaLabel}
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}

function SlotButton({
  label,
  name,
  active,
  onClick,
}: {
  label: string;
  name: string | null;
  active: boolean;
  onClick: () => void;
}) {
  const onStrikeSlot = /strike/i.test(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'focus-visible:outline-brand min-h-16 rounded-panel border p-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2',
        active
          ? 'border-brand bg-brand/10'
          : name
            ? 'border-border-subtle bg-surface'
            : 'border-border-subtle border-dashed bg-surface'
      )}
    >
      <span
        className={cn(
          'font-mono flex items-center gap-1 text-4xs font-bold tracking-eyebrow uppercase',
          active ? 'text-brand-text' : 'text-dim'
        )}
      >
        {active || (onStrikeSlot && name) ? (
          <span className={cn('h-1.5 w-1.5 rounded-full', onStrikeSlot ? 'bg-danger' : 'bg-brand')} />
        ) : null}
        {label}
      </span>
      <span className={cn('mt-0.5 block truncate text-xs font-bold', name ? 'text-ink' : 'text-dim')}>
        {name || 'Tap a Name Below'}
      </span>
    </button>
  );
}
