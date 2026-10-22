import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { uploadMediaFile, useUploadMediaMutation } from '@/shared/api/mediaApi';
import {
  BaseDialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { Field, FieldMessage } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { CloseIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';
import { Skeleton } from '@/shared/ui/states';
import { toast } from '@/shared/ui/toast';

import { useAttachTeamsToTournamentMutation, useCreateTeamMutation, useSearchTeamsQuery } from '../api/tournamentsApi';
import type { Tournament } from '../model/schemas';
import { canAddTournamentTeams, teamCrest, type TournamentTeam } from '../model/teamSchemas';

const LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const LOGO_MAX_MB = 5;

function checkLogoFile(file: File): string | null {
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) {
    return 'Logo must be JPG, PNG, WebP or GIF.';
  }
  if (file.size > LOGO_MAX_MB * 1024 * 1024) {
    return `Logo must be under ${LOGO_MAX_MB} MB.`;
  }
  return null;
}

type ManageTeamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament;
  attachedTeamIds: number[];
  attachedCount: number;
  /** 1-based group when the tournament uses groups. */
  preferredGroupIndex?: number | undefined;
  onAttached?: ((team: TournamentTeam) => void) | undefined;
};

type FormState = {
  name: string;
  code: string;
  country: string;
  city: string;
  sponsor: string;
  iconPlayers: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  code: '',
  country: DEFAULT_COUNTRY,
  city: '',
  sponsor: '',
  iconPlayers: '',
};

/** Search existing clubs → pick & attach, or create & attach. Logo: POST /media/team/{id}/logo after create (soft-fail, like legacy). */

export function ManageTeamDialog({
  open,
  onOpenChange,
  tournament,
  attachedTeamIds,
  attachedCount,
  preferredGroupIndex,
  onAttached,
}: ManageTeamDialogProps) {
  const groupCount = tournament.groupCount ?? 1;
  const hasGroups = groupCount > 1;
  const attached = useMemo(() => new Set(attachedTeamIds), [attachedTeamIds]);

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<TournamentTeam | null>(null);
  const [forceCreate, setForceCreate] = useState(false);
  const [groupIndex, setGroupIndex] = useState(() => normalizeGroup(preferredGroupIndex, groupCount));
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const searching = !picked && !forceCreate && trimmed.length >= 2;
  const search = useSearchTeamsQuery(trimmed, { skip: !open || !searching });

  const results = useMemo(() => {
    if (!searching) return [];
    return (search.data ?? []).filter((t) => !attached.has(t.id)).slice(0, 6);
  }, [searching, search.data, attached]);

  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile]);

  useEffect(() => {
    if (!logoPreview) return undefined;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  const noResults = searching && !search.isFetching && results.length === 0;
  const showCreateFields = forceCreate || noResults;

  const [createTeam, createState] = useCreateTeamMutation();
  const [attachTeams, attachState] = useAttachTeamsToTournamentMutation();
  const [uploadMedia] = useUploadMediaMutation();
  const busy = createState.isLoading || attachState.isLoading;

  const valid = picked
    ? !hasGroups || groupIndex != null
    : Boolean(form.name.trim() && form.code.trim() && form.city.trim() && form.country.trim()) &&
      (!hasGroups || groupIndex != null);

  const saveLabel = picked ? 'Add This Team to Tournament' : 'Create & Add to Tournament';
  const busyLabel = picked ? 'Adding…' : 'Creating…';

  function resetLocal(nextGroup?: number | undefined) {
    setQuery('');
    setPicked(null);
    setForceCreate(false);
    setForm(EMPTY_FORM);
    setFormError(null);
    setLogoFile(null);
    setLogoError(null);
    setGroupIndex(normalizeGroup(nextGroup ?? preferredGroupIndex, groupCount));
  }

  function onLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const bad = checkLogoFile(file);
    if (bad) {
      setLogoError(bad);
      setLogoFile(null);
      return;
    }
    setLogoError(null);
    setLogoFile(file);
  }

  async function maybeUploadLogo(teamId: number) {
    if (!logoFile) return;
    try {
      await uploadMediaFile(uploadMedia, {
        type: 'team',
        id: teamId,
        field: 'logo',
        file: logoFile,
      });
    } catch {
      toast({
        title: 'Team Created But Logo Upload Failed',
        description: 'You can retry from team settings later.',
        tone: 'error',
      });
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetLocal();
    else resetLocal(preferredGroupIndex);
    onOpenChange(next);
  }

  function startCreateFromSearch() {
    setForceCreate(true);
    setPicked(null);
    setForm((f) => ({ ...f, name: f.name || trimmed }));
  }

  async function attach(team: TournamentTeam) {
    if (!canAddTournamentTeams(tournament.teamCap, attachedCount)) {
      toast({
        title: 'Team Limit Reached',
        description: 'This tournament already has the maximum number of teams.',
        tone: 'error',
      });
      return;
    }
    await attachTeams({
      tournamentId: tournament.id,
      teamIds: [team.id],
      ...(hasGroups && groupIndex != null ? { groupIndex } : {}),
    }).unwrap();
    toast({ title: 'Team Added to Tournament', tone: 'success' });
    onAttached?.(team);
    handleOpenChange(false);
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!valid || busy) return;
    setFormError(null);
    try {
      if (picked) {
        await attach(picked);
        return;
      }
      const created = await createTeam({
        name: form.name,
        code: form.code,
        country: form.country,
        city: form.city,
        ...(form.sponsor.trim() ? { sponsor: form.sponsor } : {}),
        ...(form.iconPlayers.trim() ? { iconPlayers: form.iconPlayers } : {}),
      }).unwrap();
      const team = created.data;
      if (!team) throw new Error('Team create returned no data.');
      await maybeUploadLogo(team.id);
      await attach(team);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save team.'));
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleOpenChange}
      contentClassName="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0"
    >
      <DialogHeader>
        <DialogTitle>Add Team to Tournament</DialogTitle>
        <DialogDescription className="font-mono text-dim text-3xs font-medium tracking-eyebrow uppercase">
          {picked ? 'Existing Team Picked' : tournament.name}
        </DialogDescription>
      </DialogHeader>

      <Form id="manage-team-form" density="compact" onSubmit={(e) => void submit(e)}>
        <DialogBody className="min-h-0 flex-1 gap-3.5 overflow-y-auto">
          {hasGroups && !picked ? (
            <GroupPicker groupCount={groupCount} groupIndex={groupIndex} onChange={setGroupIndex} />
          ) : null}

          {!picked && !forceCreate ? (
            <div className="flex flex-col gap-1.5">
              <Input
                label="Team Name"
                required
                placeholder="Search by Name or Code"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                hint={noResults ? undefined : "Search teams you've run before — logo and city come with them."}
                error={noResults ? 'No team found. Add new team below.' : undefined}
              />
              {search.isFetching && searching ? <Skeleton className="h-12 w-full rounded-field" /> : null}
              {results.length ? (
                <ul className="border-border bg-surface divide-border-subtle divide-y overflow-hidden rounded-field border">
                  {results.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPicked(t);
                          setForceCreate(false);
                        }}
                        className="hover:bg-surface-raised flex w-full items-center gap-2.5 p-2.5 text-left"
                      >
                        <Avatar crest src={t.logo ?? undefined} name={teamCrest(t)} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-ink">
                            <Highlight text={t.name} query={query} />
                          </span>
                          <span className="text-dim block font-mono text-3xs">
                            {[t.code, t.city].filter(Boolean).join(' · ') || 'Team'}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={startCreateFromSearch}
                      className="hover:bg-surface-raised flex w-full items-center gap-2 px-3 py-2.5 text-left"
                    >
                      <span className="text-muted flex-1 text-3xs leading-normal">Not the team you mean?</span>
                      <span className="text-brand-text text-2xs font-bold">Add New Team</span>
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          ) : null}

          {picked ? (
            <>
              <Field label="Team Name" required hint="Locked to the existing record — clear it to search again.">
                {() => (
                  <div className="border-border-subtle bg-surface flex min-h-11 items-center gap-2.5 rounded-field border px-3">
                    <Avatar crest src={picked.logo ?? undefined} name={teamCrest(picked)} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-2xs leading-normal font-bold text-ink">{picked.name}</span>
                      <span className="text-dim block font-mono text-4xs leading-normal">
                        {[picked.code, picked.city].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="Clear Team"
                      onClick={() => {
                        setQuery(picked.name.slice(0, 3).toLowerCase());
                        setPicked(null);
                      }}
                      className="bg-surface-raised text-muted hover:text-ink grid h-6 w-6 place-items-center rounded-full"
                    >
                      <CloseIcon className="h-3 w-3" strokeWidth={2.4} />
                    </button>
                  </div>
                )}
              </Field>
              {hasGroups ? (
                <GroupPicker groupCount={groupCount} groupIndex={groupIndex} onChange={setGroupIndex} />
              ) : null}
            </>
          ) : null}

          {!picked && showCreateFields ? (
            <>
              {noResults || forceCreate ? (
                <div className="flex items-center gap-2.5">
                  <span className="bg-border-subtle h-px flex-1" />
                  <span className="text-dim font-mono text-4xs font-bold tracking-eyebrow">OR CREATE NEW</span>
                  <span className="bg-border-subtle h-px flex-1" />
                </div>
              ) : null}

              <Input
                label="New Team Name"
                required
                placeholder="Sialkot Stallions"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Team Code"
                required
                placeholder="SLS"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="font-mono tracking-wide uppercase"
              />
              <CountryCityFields
                country={form.country}
                city={form.city}
                required
                onCountryChange={(country) => setForm((f) => ({ ...f, country }))}
                onCityChange={(city) => setForm((f) => ({ ...f, city }))}
                layout="row"
              />
              <Input
                label="Sponsor"
                placeholder="Pepsi, Jazz"
                hint="Comma-separated."
                value={form.sponsor}
                onChange={(e) => setForm((f) => ({ ...f, sponsor: e.target.value }))}
              />
              <Input
                label="Icon Players"
                placeholder="Babar Azam, Shaheen Afridi"
                hint="Free text — names only, comma-separated."
                value={form.iconPlayers}
                onChange={(e) => setForm((f) => ({ ...f, iconPlayers: e.target.value }))}
              />

              <Field
                label="Logo"
                error={logoError ?? undefined}
                hint={logoError ? undefined : 'JPG, PNG, WebP or GIF, max 5 MB.'}
              >
                {({ id }) => (
                  <div className="flex items-center gap-3">
                    <Avatar
                      crest
                      src={logoPreview ?? undefined}
                      name={form.code.trim() || form.name.trim() || 'TM'}
                      size="lg"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <button
                        type="button"
                        id={id}
                        onClick={() => logoInput.current?.click()}
                        className="text-brand-text self-start text-2xs font-bold"
                      >
                        {logoFile ? 'Replace Logo' : 'Upload Logo'}
                      </button>
                      {logoFile ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoError(null);
                          }}
                          className="text-dim self-start text-3xs font-semibold"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <input
                      ref={logoInput}
                      type="file"
                      accept={LOGO_TYPES.join(',')}
                      onChange={onLogoPick}
                      className="hidden"
                    />
                  </div>
                )}
              </Field>
            </>
          ) : null}

          <FieldMessage error={formError ?? undefined} />
        </DialogBody>
      </Form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" size="md" disabled={busy}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" form="manage-team-form" size="md" disabled={!valid || busy}>
          {busy ? busyLabel : saveLabel}
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}

function normalizeGroup(preferred: number | undefined, groupCount: number): number {
  const n = Number(preferred);
  if (Number.isInteger(n) && n >= 1 && n <= groupCount) return n;
  return 1;
}

function GroupPicker({
  groupCount,
  groupIndex,
  onChange,
}: {
  groupCount: number;
  groupIndex: number;
  onChange: (n: number) => void;
}) {
  return (
    <Field label="Group" required hint="Only asked when the tournament has groups.">
      {() => (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: groupCount }, (_, i) => i + 1).map((g) => {
            const on = groupIndex === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange(g)}
                className={cn(
                  'flex min-h-10 flex-1 items-center justify-center rounded-field border px-3 text-xs font-bold',
                  on ? 'border-brand bg-brand/12 text-ink' : 'border-border bg-surface text-muted hover:text-ink'
                )}
              >
                Group {g}
              </button>
            );
          })}
        </div>
      )}
    </Field>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-brand/20 text-ink rounded-sm px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
