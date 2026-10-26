import { useState } from 'react';

import { BaseDialog, DialogBody, DialogDescription, DialogHeader, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { confirm } from '@/shared/dialogs/helpers';
import { cn } from '@/shared/lib/cn';

export type MatchAdminAction =
  | 'change_squad'
  | 'change_keeper'
  | 'substitute'
  | 'penalty'
  | 'additional_runs'
  | 'revise_target'
  | 'add_break'
  | 'match_notes'
  | 'match_rules'
  | 'end_innings'
  | 'declare_result'
  | 'cancel_match';

type MenuItem = [MatchAdminAction, string, string | null, 'danger' | null];

type MenuGroup = {
  label: string;
  danger?: boolean | undefined;
  items: MenuItem[];
};

const GROUPS: MenuGroup[] = [
  {
    label: 'Squad & people',
    items: [
      ['change_squad', 'Change Squad', null, null],
      ['change_keeper', 'Change Wicket Keeper', null, null],
      ['substitute', 'Substitute Player', null, null],
    ],
  },
  {
    label: 'Runs & target',
    items: [
      ['penalty', 'Give Penalty Runs', null, null],
      ['additional_runs', 'Add Additional Runs', null, null],
      ['revise_target', 'Revise Target', '2nd innings only', null],
    ],
  },
  {
    label: 'Record',
    items: [
      ['add_break', 'Add Breaks', null, null],
      ['match_notes', 'Match Notes', null, null],
      ['match_rules', 'Match Rules', null, null],
    ],
  },
  {
    label: 'Ends Something',
    danger: true,
    items: [
      ['end_innings', 'End Innings', null, 'danger'],
      ['declare_result', 'Declare Results', null, 'danger'],
      ['cancel_match', 'Cancel Match', null, 'danger'],
    ],
  },
];

/** Actions that open a follow-up sheet (caller closes the menu first). */

const SHEET_ACTIONS = new Set<MatchAdminAction>([
  'penalty',
  'change_keeper',
  'add_break',
  'additional_runs',
  'match_notes',
  'match_rules',
  'declare_result',
  'revise_target',
  'end_innings',
  'substitute',
  'change_squad',
  'cancel_match',
]);

type MatchActionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeShort: string;
  awayShort: string;
  scoreLine: string;
  oversDisplay: string | null;
  locked: boolean;
  secondInnings: boolean;
  hasSquad: boolean;
  tournamentShort?: string | null | undefined;
  onAction: (action: MatchAdminAction) => void;
};

/** Greys out when complete; hidden for non-operators (caller). */

export function MatchActionMenu({
  open,
  onOpenChange,
  homeShort,
  awayShort,
  scoreLine,
  oversDisplay,
  locked,
  secondInnings,
  hasSquad,
  tournamentShort = null,
  onAction,
}: MatchActionMenuProps) {
  const [busy, setBusy] = useState(false);

  async function select(code: MatchAdminAction) {
    if (locked || busy) return;

    if (code === 'cancel_match') {
      setBusy(true);
      try {
        const ok = await confirm({
          title: 'Cancel This Match?',
          message: cancelDescription(oversDisplay, tournamentShort),
          confirmLabel: 'Cancel Match',
          cancelLabel: 'Keep',
          tone: 'danger',
        });
        if (ok) {
          onOpenChange(false);
          onAction(code);
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    if (SHEET_ACTIONS.has(code)) {
      onOpenChange(false);
      onAction(code);
    }
  }

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} contentClassName="flex max-h-[88vh] flex-col gap-0 p-0">
      <DialogHeader className="border-border-subtle shrink-0 border-b">
        <DialogTitle>Action</DialogTitle>
        <DialogDescription className="font-mono text-3xs font-medium uppercase">
          {homeShort} vs {awayShort} · {scoreLine || '—'} · {oversDisplay ?? '0.0'} OVERS · you are the operator
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="min-h-0 flex-1 overflow-y-auto pb-2">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-2.5">
            <p
              className={cn(
                'font-mono mb-1.5 text-4xs font-bold tracking-eyebrow uppercase',
                g.danger ? 'text-danger-soft' : 'text-dim'
              )}
            >
              {g.label}
            </p>
            <div
              className={cn(
                'border-border-subtle bg-surface overflow-hidden rounded-panel border',
                g.danger && 'border-danger/40',
                locked && 'opacity-40'
              )}
            >
              {g.items.map(([code, label, note, tone], i) => {
                const disabled =
                  locked ||
                  (code === 'revise_target' && !secondInnings) ||
                  (code === 'change_keeper' && !hasSquad) ||
                  (code === 'substitute' && !hasSquad);
                const last = i === g.items.length - 1;
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={disabled}
                    onClick={() => void select(code)}
                    className={cn(
                      'focus-visible:outline-brand flex min-h-11 w-full items-center px-3.5 text-left hover:bg-surface-raised focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-50 disabled:hover:bg-transparent',
                      !last && 'border-border-subtle border-b'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-1 text-xs leading-normal',
                        tone === 'danger' ? 'font-bold text-danger-soft' : 'font-semibold text-ink',
                        disabled && code === 'revise_target' && 'text-muted'
                      )}
                    >
                      {label}
                    </span>
                    {note ? (
                      <span className="bg-page-deep font-mono text-dim shrink-0 rounded-chip px-1.5 py-0.5 text-4xs font-bold tracking-eyebrow uppercase">
                        {note}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </DialogBody>

      <p className="text-dim shrink-0 px-5 pb-5 text-3xs leading-relaxed">
        Every item here greys out the moment the match is complete, and the whole menu is hidden for anyone who
        can&apos;t operate.
      </p>
    </BaseDialog>
  );
}

function cancelDescription(oversDisplay: string | null, tournamentShort: string | null | undefined) {
  const overs = oversDisplay ?? '0.0';
  const back = tournamentShort
    ? ` The fixture returns to ${tournamentShort} unplayed.`
    : ' The match is removed from My Matches.';
  return `${overs} overs of scoring, both innings, and every ball in the log are discarded.${back} This cannot be undone.`;
}
