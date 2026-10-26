import { useState } from 'react';

import { useExtraTypeOptions, useGetEnumsQuery } from '@/shared/api/enumsApi';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { enumOptions } from '@/shared/model/enums';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import type { BallLogEntry } from '../lib/ballLog';
import type { EditBallExtra, EditBallFormPatch } from '../lib/editBallPayload';

const RUNS = [0, 1, 2, 3, 4, 6] as const;

/** API `bye` → edit-form `b` (UpdateBallRequest uses is_bye). */

function apiExtraToEdit(value: string): EditBallExtra | undefined {
  if (value === 'bye') return 'b';
  if (value === 'wd' || value === 'nb' || value === 'lb') return value;
  return undefined;
}

type EditBallSheetProps = {
  entry: BallLogEntry | null;
  overNo: number | null;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: EditBallFormPatch) => void;
  saving?: boolean | undefined;
};

/** Wickets aren't editable here (delete + re-score); + opens custom runs; shot area names the wagon zone from GET /enums → shot_position. */

export function EditBallSheet({ entry, overNo, onOpenChange, onSave, saving }: EditBallSheetProps) {
  // Closed sheet — bail before hooks. Form keyed on `entry.id` remounts per ball (no sync effect).
  if (!entry) return null;

  return (
    <EditBallForm
      key={entry.id}
      entry={entry}
      overNo={overNo}
      onOpenChange={onOpenChange}
      onSave={onSave}
      saving={saving}
    />
  );
}

type EditBallFormProps = {
  entry: BallLogEntry;
  overNo: number | null;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: EditBallFormPatch) => void;
  saving?: boolean | undefined;
};

function EditBallForm({ entry, overNo, onOpenChange, onSave, saving }: EditBallFormProps) {
  const [runs, setRuns] = useState(entry.runs);
  const [extra, setExtra] = useState<EditBallExtra>(entry.extra);
  const [zone, setZone] = useState<string | null>(entry.zone);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('5');
  const [pickingZone, setPickingZone] = useState(false);
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  const { options: extraTypes } = useExtraTypeOptions();
  const zones = enumOptions(enums, 'shot_position');
  const extras: Array<[EditBallExtra, string]> = [
    [null, 'NONE'],
    ...extraTypes.flatMap((option): Array<[EditBallExtra, string]> => {
      const value = apiExtraToEdit(option.value);
      return value != null ? [[value, option.short_label]] : [];
    }),
  ];

  const ballRef =
    overNo != null && entry.ballInOver != null
      ? `${overNo}.${entry.ballInOver}`
      : overNo != null
        ? String(overNo)
        : String(entry.overNumber + 1);
  const zoneLabel = zone ? (zones.find((z) => z.value === zone)?.label ?? String(zone).replace(/_/g, ' ')) : 'Not Set';
  const customSelected = !(RUNS as readonly number[]).includes(runs);
  const penaltyLocked = entry.kind === 'penalty' || entry.kind === 'additional_runs';

  function commit() {
    onSave({ runs, extra: penaltyLocked ? entry.extra : extra, zone });
  }

  return (
    <>
      <BaseDialog open onOpenChange={onOpenChange} showClose>
        <DialogHeader>
          <DialogTitle>Edit Ball</DialogTitle>
          <DialogDescription>
            {entry.by ? `${entry.by}${entry.on ? ` to ${entry.on}` : ''}. ` : ''}
            Ball {ballRef}. Saving re-runs the innings totals from this ball forward.
          </DialogDescription>
        </DialogHeader>

        <Form
          id="edit-ball-form"
          density="compact"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <DialogBody>
            <Field
              label={
                entry.kind === 'penalty'
                  ? 'Penalty Runs'
                  : entry.kind === 'additional_runs'
                    ? 'Additional Runs'
                    : 'Runs off the Bat'
              }
              required
            >
              <div className="grid grid-cols-4 gap-2">
                {RUNS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRuns(r)}
                    className={cn(
                      'font-mono focus-visible:outline-brand grid min-h-11 place-items-center rounded-icon border text-body-lg font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2',
                      runs === r && !customSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-border-subtle bg-surface text-muted'
                    )}
                  >
                    {r}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomValue(String(customSelected ? runs : 5));
                    setCustomOpen(true);
                  }}
                  className={cn(
                    'font-mono focus-visible:outline-brand grid min-h-11 place-items-center rounded-icon border text-body-lg font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2',
                    customSelected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-muted'
                  )}
                >
                  {customSelected ? runs : '+'}
                </button>
                <button
                  type="button"
                  disabled
                  title="Delete This Ball and Re-Score the Wicket"
                  className="border-danger/45 text-danger font-mono grid min-h-11 place-items-center rounded-icon border text-3xs font-extrabold tracking-eyebrow uppercase opacity-70"
                >
                  Wkt
                </button>
              </div>
            </Field>

            {!penaltyLocked ? (
              <Field label="Extra">
                <div className="flex flex-wrap gap-1.5">
                  {extras.map(([value, label]) => {
                    const on = extra === value;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setExtra(value)}
                        className={cn(
                          'font-mono focus-visible:outline-brand flex min-h-11 items-center rounded-icon border px-3 text-3xs font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2',
                          on ? 'border-brand bg-brand/12 text-ink' : 'border-border-subtle bg-surface text-dim'
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            ) : null}

            <Field label="Shot Area">
              {isLoading ? (
                <Skeleton className="h-11 w-full rounded-icon" />
              ) : isError ? (
                <ErrorState title="Couldn't Load Shot Zones" onRetry={() => void refetch()} />
              ) : pickingZone ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {zones.map((z) => (
                    <button
                      key={z.value}
                      type="button"
                      onClick={() => {
                        setZone(z.value);
                        setPickingZone(false);
                      }}
                      className={cn(
                        'focus-visible:outline-brand flex min-h-11 items-center justify-center rounded-icon border text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
                        zone === z.value
                          ? 'border-brand bg-brand/12 text-brand-text'
                          : 'border-border-subtle bg-surface text-ink'
                      )}
                    >
                      {z.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setZone(null);
                      setPickingZone(false);
                    }}
                    className="border-border-subtle text-muted focus-visible:outline-brand col-span-2 flex min-h-11 items-center justify-center rounded-icon border text-2xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Clear zone
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickingZone(true)}
                  className="border-border-subtle bg-surface text-body focus-visible:outline-brand flex min-h-11 w-full items-center rounded-icon border px-3.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="capitalize">{zoneLabel}</span>
                  <span className="text-dim ml-auto text-sm font-semibold">›</span>
                </button>
              )}
            </Field>
          </DialogBody>
        </Form>

        <DialogFooter>
          <Button variant="secondary" size="md" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="edit-ball-form" size="md" disabled={saving}>
            Save Ball
          </Button>
        </DialogFooter>
      </BaseDialog>

      <BaseDialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogHeader>
          <DialogTitle>Custom Runs</DialogTitle>
          <DialogDescription>Enter any run value from 0 to 255.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input
            label="Runs"
            required
            type="number"
            min={0}
            max={255}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            inputMode="numeric"
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={() => setCustomOpen(false)}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={() => {
              const n = Math.max(0, Math.min(255, Number(customValue) || 0));
              setRuns(n);
              setCustomOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </BaseDialog>
    </>
  );
}
