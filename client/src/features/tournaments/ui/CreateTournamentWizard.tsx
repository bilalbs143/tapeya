import { type ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useTournamentTypeOptions } from '@/shared/api/enumsApi';
import { getApiErrorMessage } from '@/shared/api/errors';
import { PageDock } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Field } from '@/shared/ui/Field';
import { Form, FormRow } from '@/shared/ui/Form';
import { CheckIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';
import { NumberStepper } from '@/shared/ui/NumberStepper';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { toast } from '@/shared/ui/toast';

import { useCreateTournamentMutation } from '../api/tournamentsApi';
import type { CreateTournamentInput } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';

/** Fields match legacy create + StoreUserTournamentRequest (no ball/format/timings). */
type WizardState = {
  name: string;
  shortName: string;
  type: string;
  structure: 'single' | 'groups';
  groupCount: number;
  teamCap: number;
  venue: string;
  country: string;
  city: string;
  starts: string;
  ends: string;
  prize: string;
};

type CreateTournamentWizardProps = {
  header: ReactNode;
  onCreated: (id: number) => void;
  /** Controlled step from the page ScreenBar (avoids double chrome). */
  step: number;
  onStepChange: (step: number) => void;
  /** Lets the page swap subtitle / hide step progress on the success face. */
  onSentChange?: ((sent: boolean) => void) | undefined;
  initial?: Partial<WizardState> | undefined;
};

/** Create tournament wizard body; page owns ScreenBar. Success → organizer workspace. */
export function CreateTournamentWizard({
  header,
  onCreated,
  step,
  onStepChange,
  onSentChange,
  initial,
}: CreateTournamentWizardProps) {
  const [createTournament, { isLoading }] = useCreateTournamentMutation();
  const {
    options: tournamentTypes,
    isLoading: typeLoading,
    isError: typeError,
    refetch: refetchTypes,
  } = useTournamentTypeOptions();
  const [sent, setSent] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [f, setF] = useState<WizardState>({
    name: initial?.name ?? '',
    shortName: initial?.shortName ?? '',
    type: initial?.type ?? 'open_tournament',
    structure: initial?.structure ?? 'single',
    groupCount: initial?.groupCount ?? 2,
    teamCap: initial?.teamCap ?? 4,
    venue: initial?.venue ?? '',
    country: initial?.country ?? DEFAULT_COUNTRY,
    city: initial?.city ?? '',
    starts: initial?.starts ?? '',
    ends: initial?.ends ?? '',
    prize: initial?.prize ?? '',
  });

  const resolvedType = tournamentTypes.some((o) => o.value === f.type) ? f.type : (tournamentTypes[0]?.value ?? f.type);

  const dateError = f.starts && f.ends && f.ends < f.starts ? "End date can't be before the start." : null;

  const stepOk = useMemo(() => {
    if (step === 0) {
      if (!f.name.trim() || !f.shortName.trim()) return false;
      if (f.teamCap < 2 || f.teamCap > 500) return false;
      if (f.structure === 'groups' && (f.groupCount < 2 || f.groupCount > 16)) return false;
      return true;
    }
    return (
      Boolean(f.venue.trim()) &&
      Boolean(f.country.trim()) &&
      Boolean(f.city.trim()) &&
      Boolean(f.starts) &&
      Boolean(f.ends) &&
      !dateError
    );
  }, [step, f, dateError]);

  async function submit() {
    const payload: CreateTournamentInput = {
      name: f.name.trim(),
      shortName: f.shortName.trim() || f.name.trim().slice(0, 64),
      city: f.city.trim(),
      country: f.country.trim(),
      venueName: f.venue.trim(),
      numberOfTeams: f.teamCap,
      type: resolvedType as CreateTournamentInput['type'],
      structure: f.structure,
      startDate: f.starts,
      endDate: f.ends,
      ...(f.structure === 'groups' ? { groupCount: f.groupCount } : {}),
      ...(f.prize.trim() ? { prize: f.prize.trim() } : {}),
    };
    try {
      const result = await createTournament(payload).unwrap();
      if (result.message) toast({ title: result.message, tone: 'success' });
      if (result.data) {
        setCreatedId(result.data.id);
        setSent(true);
        onSentChange?.(true);
      }
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not create tournament.'),
        tone: 'error',
      });
    }
  }

  if (sent) {
    return (
      <PageDock
        body="fill"
        header={header}
        footer={
          <StickyActionBar>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="min-h-12 flex-1 font-bold"
                onClick={() => {
                  setSent(false);
                  onSentChange?.(false);
                  onStepChange(0);
                  setCreatedId(null);
                }}
              >
                Create Another
              </Button>
              <Button
                className="min-h-12 flex-1 font-bold"
                onClick={() => {
                  if (createdId != null) onCreated(createdId);
                }}
              >
                Open Workspace
              </Button>
            </div>
          </StickyActionBar>
        }
      >
        <SentFace name={f.name || 'Your tournament'} />
      </PageDock>
    );
  }

  return (
    <PageDock
      header={header}
      footer={
        <StickyActionBar>
          <div className="flex gap-2">
            {step === 0 ? (
              <Button variant="secondary" className="shrink-0 px-4 font-bold" asChild>
                <Link to={tournamentRoutes.list()}>Cancel</Link>
              </Button>
            ) : (
              <Button variant="secondary" className="shrink-0 px-4 font-bold" onClick={() => onStepChange(step - 1)}>
                Back
              </Button>
            )}
            {step < 1 ? (
              <Button className="flex-1 font-bold" disabled={!stepOk} onClick={() => onStepChange(step + 1)}>
                Where & When
              </Button>
            ) : (
              <Button
                className="flex-1 font-bold"
                disabled={!stepOk || isLoading}
                loading={isLoading}
                onClick={() => void submit()}
              >
                Open Workspace
              </Button>
            )}
          </div>
        </StickyActionBar>
      }
    >
      <Form density="compact" className="flex flex-col px-4 pt-3.5 pb-4" onSubmit={(e) => e.preventDefault()}>
        {step === 0 ? (
          <>
            <Input
              label="Name"
              required
              value={f.name}
              maxLength={60}
              onChange={(e) => setF((s) => ({ ...s, name: e.target.value.slice(0, 60) }))}
            />
            <Input
              label="Short Name"
              required
              value={f.shortName}
              maxLength={64}
              hint="Used on scorecards and the live ticker."
              onChange={(e) => setF((s) => ({ ...s, shortName: e.target.value.slice(0, 64) }))}
            />

            <Field label="Tournament Type">
              {() =>
                typeError ? (
                  <ErrorState title="Couldn’t Load Tournament Types" onRetry={() => void refetchTypes()} />
                ) : typeLoading && tournamentTypes.length === 0 ? (
                  <Skeleton className="h-20 w-full rounded-panel" aria-label="Loading Tournament Types" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {tournamentTypes.map((opt) => (
                      <ChoiceCard
                        key={opt.value}
                        on={resolvedType === opt.value}
                        onClick={() => setF((s) => ({ ...s, type: opt.value }))}
                      >
                        {opt.label.replace(/ Tournament$/i, '')}
                      </ChoiceCard>
                    ))}
                  </div>
                )
              }
            </Field>

            <Field label="Number of Teams" required>
              <NumberStepper
                value={f.teamCap}
                min={2}
                max={500}
                onChange={(teamCap) => setF((s) => ({ ...s, teamCap }))}
                decreaseLabel="Decrease Teams"
                increaseLabel="Increase Teams"
              />
            </Field>

            <Field label="How Do Teams Play?" required>
              {() => (
                <div className="flex flex-col gap-2">
                  <StructureOption
                    on={f.structure === 'single'}
                    onClick={() => setF((s) => ({ ...s, structure: 'single' }))}
                    title="Single Table"
                    body={`All ${f.teamCap} teams in one standings table.`}
                  />
                  <StructureOption
                    on={f.structure === 'groups'}
                    onClick={() => setF((s) => ({ ...s, structure: 'groups' }))}
                    title="Group Wise"
                    body="Split into groups, then knockouts."
                  />
                </div>
              )}
            </Field>

            {f.structure === 'groups' ? (
              <Field label="Number of Groups" required>
                <NumberStepper
                  value={f.groupCount}
                  min={2}
                  max={16}
                  onChange={(groupCount) => setF((s) => ({ ...s, groupCount }))}
                  decreaseLabel="Decrease Groups"
                  increaseLabel="Increase Groups"
                />
              </Field>
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Input
              label="Venue"
              required
              value={f.venue}
              onChange={(e) => setF((s) => ({ ...s, venue: e.target.value }))}
            />
            <CountryCityFields
              country={f.country}
              city={f.city}
              required
              onCountryChange={(country) => setF((s) => ({ ...s, country }))}
              onCityChange={(city) => setF((s) => ({ ...s, city }))}
              layout="row"
            />
            <FormRow>
              <DatePicker
                label="Starts"
                required
                days="any"
                value={f.starts}
                onChange={(starts) => setF((s) => ({ ...s, starts }))}
              />
              <DatePicker
                label="Ends"
                required
                days="any"
                value={f.ends}
                error={dateError ?? undefined}
                onChange={(ends) => setF((s) => ({ ...s, ends }))}
              />
            </FormRow>
            <Input
              label="Prize"
              value={f.prize}
              placeholder="e.g. Trophy + cash"
              onChange={(e) => setF((s) => ({ ...s, prize: e.target.value }))}
            />
            <div className="border-border-subtle bg-surface rounded-card border px-3.5 py-3.5">
              <p className="font-mono text-brand-text text-4xs font-bold tracking-eyebrow uppercase">
                What happens next
              </p>
              <p className="text-body mt-2 text-2xs leading-relaxed">
                Opens in My tournaments. Add teams and fixtures from the workspace.
              </p>
            </div>
          </>
        ) : null}
      </Form>
    </PageDock>
  );
}

const NEXT_STEPS = [
  { label: 'Created', done: true },
  { label: 'Add Teams', done: false },
  { label: 'Publish Fixtures', done: false },
] as const;

function SentFace({ name }: { name: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3.5 pb-4">
      <div className="flex flex-col items-center pt-4 text-center">
        <span className="border-positive/40 bg-positive/14 grid h-14 w-14 place-items-center rounded-sheet border">
          <CheckIcon size="lg" strokeWidth={2.2} className="text-positive-2 h-7 w-7" />
        </span>
        <h1 className="mt-4 text-title leading-snug font-extrabold tracking-tight text-ink">{name}</h1>
        <p className="text-muted mt-2 max-w-[36ch] text-body-sm leading-relaxed" role="status">
          Add teams, finish squads, then publish fixtures from the workspace.
        </p>
      </div>

      <ol className="border-border-subtle bg-surface mt-6 divide-border-subtle flex flex-col divide-y rounded-card border">
        {NEXT_STEPS.map((item, i) => (
          <li key={item.label} className="flex items-center gap-3 px-3.5 py-3">
            <span
              className={cn(
                'font-mono grid h-7 w-7 shrink-0 place-items-center rounded-full text-2xs font-bold',
                item.done ? 'bg-positive/16 text-positive' : 'bg-surface-raised text-dim'
              )}
              aria-hidden
            >
              {item.done ? <CheckIcon size="sm" strokeWidth={2.6} className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn('text-body-sm font-semibold', item.done ? 'text-ink' : 'text-muted')}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ChoiceCard({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-12 rounded-panel border px-3 text-body-sm font-bold',
        on ? 'border-brand bg-brand/12 text-brand-text' : 'border-border-subtle bg-surface text-ink'
      )}
    >
      {children}
    </button>
  );
}

function StructureOption({
  on,
  onClick,
  title,
  body,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-panel border px-3.5 py-3 text-left',
        on ? 'border-brand bg-brand/12' : 'border-border-subtle bg-surface'
      )}
    >
      <p className="text-body-sm font-extrabold text-ink">{title}</p>
      <p className="text-muted mt-1 text-2xs leading-relaxed">{body}</p>
    </button>
  );
}
