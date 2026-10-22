import { Field } from '@/shared/ui/Field';
import { Input, Textarea } from '@/shared/ui/Input';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { formatAdminNoteTime } from '../lib/adminActionSheetMeta';
import type { AdminPlayer, AdminSheetAction } from '../lib/adminActionSheetTypes';
import { AdminActionChoiceRow } from './AdminActionChoiceRow';
import { AdminActionInlineStepper } from './AdminActionInlineStepper';
import { AdminActionPlayerPickRow } from './AdminActionPlayerPickRow';
import type { useAdminActionSheet } from './useAdminActionSheet';

type AdminActionSheetModel = ReturnType<typeof useAdminActionSheet>;

type AdminActionSheetBodyProps = {
  action: AdminSheetAction;
  fieldingPlayers: AdminPlayer[];
  currentBowlerId: number | null;
  batsmenOnCrease: AdminPlayer[];
  eligibleSubstitutes: AdminPlayer[];
  rulesRows: [string, string][];
  model: AdminActionSheetModel;
};

/** Action-specific form body for AdminActionSheet. */
export function AdminActionSheetBody({
  action,
  fieldingPlayers,
  currentBowlerId,
  batsmenOnCrease,
  eligibleSubstitutes,
  rulesRows,
  model,
}: AdminActionSheetBodyProps) {
  const {
    breakOptions,
    enumsLoading,
    enumsError,
    refetchEnums,
    squadQuery,
    notesQuery,
    selectedKeeper,
    setSelectedKeeper,
    offId,
    setOffId,
    onId,
    setOnId,
    fielderId,
    setFielderId,
    runs,
    setRuns,
    breakType,
    setBreakType,
    breakNotes,
    setBreakNotes,
    noteText,
    setNoteText,
    deletingNoteId,
    deleteNoteLoading,
    handleDeleteNote,
  } = model;

  if (action === 'add_break') {
    if (enumsError) {
      return <ErrorState title="Couldn't Load Break Types" onRetry={() => void refetchEnums()} />;
    }
    if (enumsLoading && breakOptions.length === 0) {
      return <Skeleton className="h-24 w-full rounded-panel" />;
    }
    return (
      <>
        <Field label="Type" required>
          <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
            {breakOptions.map((opt) => (
              <AdminActionChoiceRow
                key={opt.value}
                selected={breakType === opt.value}
                onClick={() => setBreakType(opt.value)}
                title={opt.label}
              />
            ))}
          </div>
        </Field>
        <Textarea
          label="Notes"
          value={breakNotes}
          onChange={(e) => setBreakNotes(e.target.value)}
          placeholder="Any detail for the log…"
          className="min-h-15.5 text-2xs"
        />
      </>
    );
  }

  if (action === 'additional_runs') {
    return (
      <Field label="Runs" required>
        <AdminActionInlineStepper value={runs} onBump={(d) => setRuns((n) => Math.min(255, Math.max(1, n + d)))} />
      </Field>
    );
  }

  if (action === 'substitute') {
    if (batsmenOnCrease.length === 0) {
      return (
        <p className="text-muted text-xs leading-relaxed">
          No batters on the crease — set the crease before substituting.
        </p>
      );
    }
    return (
      <>
        <Field label="Off — on crease" required>
          <div className="border-border-subtle divide-border-subtle overflow-hidden divide-y rounded-icon border">
            {batsmenOnCrease.map((p, i) => (
              <AdminActionPlayerPickRow
                key={p.id}
                player={p}
                selected={offId === p.id}
                meta={i === 0 ? 'Striker' : 'Non-Striker'}
                chevron
                onClick={() => setOffId(p.id)}
              />
            ))}
          </div>
        </Field>
        <Field label="On — from XI" required>
          {eligibleSubstitutes.length === 0 ? (
            <p className="text-muted text-xs">No eligible substitutes left.</p>
          ) : (
            <div className="border-border-subtle divide-border-subtle max-h-40 overflow-y-auto divide-y rounded-icon border">
              {eligibleSubstitutes.map((p) => (
                <AdminActionPlayerPickRow
                  key={p.id}
                  player={p}
                  selected={onId === p.id}
                  meta={p.role ?? 'Available'}
                  chevron
                  onClick={() => setOnId(p.id)}
                />
              ))}
            </div>
          )}
        </Field>
        {fieldingPlayers.length > 0 ? (
          <Field label="Fielder">
            <div className="border-border-subtle divide-border-subtle max-h-32 overflow-y-auto divide-y rounded-icon border">
              {fieldingPlayers.map((p) => (
                <AdminActionPlayerPickRow
                  key={p.id}
                  player={p}
                  selected={fielderId === p.id}
                  meta={p.role ?? 'Fielding'}
                  chevron
                  onClick={() => setFielderId(fielderId === p.id ? null : p.id)}
                />
              ))}
            </div>
          </Field>
        ) : null}
      </>
    );
  }

  if (action === 'change_keeper') {
    if (squadQuery.isError) {
      return <ErrorState title="Couldn't Load Squad" onRetry={() => void squadQuery.refetch()} />;
    }
    if (squadQuery.isLoading && fieldingPlayers.length === 0) {
      return <Skeleton className="h-24 w-full rounded-panel" />;
    }
    if (fieldingPlayers.length === 0) {
      return (
        <p className="text-muted text-xs leading-relaxed">
          No declared squad for the fielding side — Change Keeper needs Declare Squad first.
        </p>
      );
    }
    return (
      <Field label="Wicket-keeper" required>
        <div className="flex flex-col gap-1.5">
          {fieldingPlayers.map((p) => {
            const isBowling = currentBowlerId != null && p.id === currentBowlerId;
            const current = squadQuery.data?.wicketKeeperId != null && p.id === squadQuery.data.wicketKeeperId;
            const picked = selectedKeeper === p.id;
            return (
              <AdminActionPlayerPickRow
                key={p.id}
                player={p}
                selected={picked}
                disabled={isBowling}
                bordered
                meta={isBowling ? 'Bowling' : current ? 'Current WK' : (p.role ?? undefined)}
                metaTone={current && !isBowling ? 'positive' : undefined}
                onClick={() => setSelectedKeeper(p.id)}
              />
            );
          })}
        </div>
      </Field>
    );
  }

  if (action === 'match_rules') {
    return (
      <div className="border-border-subtle bg-surface divide-border-subtle/80 divide-y overflow-hidden rounded-panel border">
        {rulesRows.map(([label, value]) => (
          <div key={label} className="flex min-h-9.5 items-center justify-between gap-3 px-3.5">
            <span className="text-muted text-xs font-semibold">{label}</span>
            <span className="text-right text-xs font-bold text-ink">{value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (action === 'match_notes') {
    return (
      <>
        {notesQuery.isError ? (
          <ErrorState title="Couldn't Load Notes" onRetry={() => void notesQuery.refetch()} />
        ) : notesQuery.isLoading ? (
          <Skeleton className="h-20 w-full rounded-panel" />
        ) : (notesQuery.data ?? []).length === 0 ? (
          <p className="text-muted text-xs">No notes yet.</p>
        ) : (
          <div className="flex max-h-52 flex-col gap-2 overflow-y-auto">
            {(notesQuery.data ?? []).map((n) => (
              <div key={n.id} className="border-border-subtle rounded-field border px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">
                    {[n.authorName, n.createdAt ? formatAdminNoteTime(n.createdAt) : null].filter(Boolean).join(' · ')}
                  </p>
                  <button
                    type="button"
                    aria-label="Delete Note"
                    disabled={deletingNoteId === n.id || deleteNoteLoading}
                    onClick={() => void handleDeleteNote(n.id)}
                    className="text-dim hover:text-danger-soft text-3xs font-bold uppercase disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink">{n.body}</p>
              </div>
            ))}
          </div>
        )}
        <Input
          label="New Note"
          placeholder="Add a Note…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value.slice(0, 5000))}
        />
      </>
    );
  }

  return null;
}
