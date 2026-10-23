import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { useTournamentTypeOptions } from '@/shared/api/enumsApi';
import { getApiErrorMessage } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Field } from '@/shared/ui/Field';
import { Form, FormRow, FormSection } from '@/shared/ui/Form';
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
  onCreated: (id: number) => void;
  /** Controlled step from the page ScreenBar (avoids double chrome). */
  step: number;
  onStepChange: (step: number) => void;
  initial?: Partial<WizardState> | undefined;
};

/** Create tournament wizard body; page owns ScreenBar. Success → organizer workspace. */

export function CreateTournamentWizard({ onCreated, step, onStepChange, initial }: CreateTournamentWizardProps) {
  const { data: me } = useMeQuery();
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
    if (step === 0) return f.name.trim().length > 0 && f.shortName.trim().length > 0;
    if (step === 1) {
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
      <SentFace
        name={f.name || 'Your tournament'}
        onOpen={() => {
          if (createdId != null) onCreated(createdId);
        }}
        onAnother={() => {
          setSent(false);
          onStepChange(0);
          setCreatedId(null);
        }}
      />
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-1 flex-col">
      <Form density="compact" className="flex flex-1 flex-col px-4 pt-3.5 pb-4" onSubmit={(e) => e.preventDefault()}>
        {step === 0 ? (
          <>
            <FormSection title="Organizer Contact">
              <div className="border-border-subtle bg-surface flex min-h-11 items-center justify-between gap-3 rounded-panel border px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm leading-normal font-extrabold text-ink">{me?.name || 'Organizer'}</p>
                  <p className="text-dim font-mono mt-0.5 text-4xs font-bold tracking-[.1em] uppercase">From Profile</p>
                </div>
              </div>
            </FormSection>

            <FormSection title="The Tournament">
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
            </FormSection>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field label="Number of Teams" required hint="2–500. You add the teams yourself in the workspace.">
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

        {step === 2 ? (
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
            <Field label="Prize">
              {({ id }) => (
                <div className="border-border bg-surface focus-within:outline-brand flex h-11 items-center rounded-panel border px-3 focus-within:outline-2 focus-within:outline-offset-0">
                  <span className="text-dim font-mono mr-2 text-xs font-bold">PKR</span>
                  <input
                    id={id}
                    value={f.prize}
                    onChange={(e) => setF((s) => ({ ...s, prize: e.target.value }))}
                    placeholder="150,000"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none"
                  />
                </div>
              )}
            </Field>
            <div className="border-border-subtle bg-surface rounded-card border px-3.5 py-3.5">
              <p className="font-mono text-brand-text text-4xs font-bold tracking-eyebrow uppercase">
                What happens next
              </p>
              <p className="text-body mt-2 text-2xs leading-relaxed">
                Your tournament opens in My tournaments right away. Add teams and fixtures from the workspace — nothing
                is public until you publish fixtures.
              </p>
            </div>
          </>
        ) : null}
      </Form>

      <StickyActionBar>
        <div className="flex gap-2">
          {step === 0 ? (
            <Button variant="secondary" className="flex-1 font-semibold" asChild>
              <Link to={tournamentRoutes.list()}>Cancel</Link>
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1 font-semibold" onClick={() => onStepChange(step - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button className="flex-1 font-bold" disabled={!stepOk} onClick={() => onStepChange(step + 1)}>
              {step === 0 ? 'Structure' : 'Where & When'}
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
    </div>
  );
}

function SentFace({ name, onOpen, onAnother }: { name: string; onOpen: () => void; onAnother: () => void }) {
  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <p className="font-mono text-positive text-4xs font-bold tracking-eyebrow uppercase">Ready</p>
      <h1 className="mt-2 text-title font-extrabold tracking-tight text-ink">{name}</h1>
      <p className="text-muted mt-2 text-body-sm leading-relaxed">
        Workspace is open. Add teams, finish squads, then schedule fixtures.
      </p>
      <ol className="border-border-subtle mt-6 flex flex-col gap-3 rounded-card border p-3.5">
        {['Created', 'Add Teams', 'Publish Fixtures'].map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                'font-mono grid h-7 w-7 place-items-center rounded-full text-2xs font-bold',
                i === 0 ? 'bg-positive/16 text-positive' : 'bg-surface-raised text-dim'
              )}
            >
              {i + 1}
            </span>
            <span className={cn('text-body-sm font-semibold', i === 0 ? 'text-ink' : 'text-muted')}>{label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button className="min-h-12 font-bold" onClick={onOpen}>
          Open Workspace
        </Button>
        <Button variant="secondary" className="min-h-11 font-semibold" onClick={onAnother}>
          Create Another
        </Button>
      </div>
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
