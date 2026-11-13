import { useState } from 'react';

import {
  countryByCode,
  DEFAULT_COUNTRY_CODE,
  nationalDigits,
  nationalNumberError,
  PhoneField,
  toE164,
} from '@/features/auth';
import { useLookupMyUsersQuery, useLookupUsersQuery } from '@/features/profile';

import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';

import { playerError, type QuickMatchPlayer } from '../lib/quickMatchPayload';

type AddQuickMatchPlayerSheetProps = {
  open: boolean;
  sideLabel: string;
  takenIds: number[];
  initialMode?: 'find' | 'new' | undefined;
  onOpenChange: (open: boolean) => void;
  onAdd: (player: QuickMatchPlayer) => void;
};

function phoneDigits(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function AddQuickMatchPlayerSheet({
  open,
  sideLabel,
  takenIds,
  initialMode = 'find',
  onOpenChange,
  onAdd,
}: AddQuickMatchPlayerSheetProps) {
  const [mode, setMode] = useState<'find' | 'new'>(initialMode);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [national, setNational] = useState('');
  const dial = countryByCode(countryCode).dial;
  const [error, setError] = useState<string | null>(null);
  const taken = new Set(takenIds);
  const query = search.trim();
  const mine = useLookupMyUsersQuery(undefined, { skip: !open || mode !== 'find' || query.length >= 2 });
  const found = useLookupUsersQuery(query, { skip: !open || mode !== 'find' || query.length < 2 });
  const rows = (query.length >= 2 ? found.data : mine.data) ?? [];
  const loading = query.length >= 2 ? found.isFetching : mine.isFetching;

  const phone = toE164(dial, national);
  const phoneReady = nationalNumberError(national, dial) == null && nationalDigits(national).length > 0;
  const phoneLookup = useLookupUsersQuery(phone, {
    skip: !open || mode !== 'new' || !phoneReady,
  });
  const matchedUser =
    phoneReady && phoneLookup.data
      ? (phoneLookup.data.find((user) => phoneDigits(user.phone) === phoneDigits(phone)) ?? null)
      : null;
  const matchedLabel = matchedUser ? matchedUser.name?.trim() || matchedUser.nickname?.trim() || 'Player' : null;

  function close() {
    setError(null);
    setSearch('');
    setName('');
    setNational('');
    onOpenChange(false);
  }

  function addExisting(id: number, label: string) {
    if (taken.has(id)) return;
    onAdd({ userId: id, name: label });
    close();
  }

  function addWalkUp() {
    const phoneError = nationalNumberError(national, dial);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // Known phone → attach that Tapeya account; typed name is ignored.
    if (matchedUser && matchedLabel) {
      if (taken.has(matchedUser.id)) {
        setError('That player is already on a side.');
        return;
      }
      onAdd({ userId: matchedUser.id, name: matchedLabel });
      close();
      return;
    }

    if (phoneLookup.isFetching) {
      setError('Checking that number…');
      return;
    }

    const next = playerError({ name, phone });
    if (next) {
      setError(next);
      return;
    }
    onAdd({ name: name.trim(), phone });
    close();
  }

  return (
    <BaseDialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogHeader>
        <DialogTitle>Add to {sideLabel}</DialogTitle>
        <DialogDescription>
          Pick someone on Tapeya, or enter a phone — if they already have an account we use their name.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="max-h-[80dvh] overflow-y-auto">
        <div className="bg-page-deep flex gap-1 rounded-panel p-1">
          {(
            [
              ['find', 'Find'],
              ['new', 'New Player'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                setError(null);
              }}
              className={cn(
                'min-h-9 flex-1 rounded-field text-2xs font-bold',
                mode === id ? 'bg-surface text-ink' : 'text-dim'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'find' ? (
          <>
            <Input
              aria-label="Search Players"
              placeholder="Name or Nickname"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
              {loading ? <p className="text-dim text-2xs">Looking Up Players…</p> : null}
              {!loading && rows.length === 0 ? (
                <p className="text-dim text-2xs">
                  {query.length >= 2 ? 'No matches.' : 'Players you have added before show up here.'}
                </p>
              ) : null}
              {rows
                .filter((user) => !taken.has(user.id))
                .map((user) => {
                  const label = user.name?.trim() || user.nickname?.trim() || 'Player';
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => addExisting(user.id, label)}
                      className="border-border-subtle hover:border-brand/40 min-h-11 rounded-field border px-3 text-left text-sm font-bold text-ink"
                    >
                      {label}
                      {user.nickname ? (
                        <span className="text-dim ml-2 text-2xs font-medium">@{user.nickname}</span>
                      ) : null}
                    </button>
                  );
                })}
            </div>
          </>
        ) : (
          <Form
            id="add-quick-match-player"
            density="compact"
            onSubmit={(event) => {
              event.preventDefault();
              addWalkUp();
            }}
          >
            <PhoneField
              label="Phone Number"
              required
              countryCode={countryCode}
              onCountryCodeChange={(code) => {
                setCountryCode(code);
                setError(null);
              }}
              value={national}
              onNationalChange={(value) => {
                setNational(value);
                setError(null);
              }}
              error={error ?? undefined}
            />

            {phoneReady && phoneLookup.isFetching ? (
              <p className="text-dim text-2xs" role="status">
                Checking that number…
              </p>
            ) : null}

            {matchedUser && matchedLabel ? (
              <p
                className="border-border-subtle rounded-panel border bg-transparent px-3 py-2.5 text-2xs leading-snug"
                role="status"
              >
                <span className="text-muted font-mono text-4xs font-bold tracking-eyebrow uppercase">On Tapeya</span>
                <span className="mt-1 block text-sm font-bold text-ink">{matchedLabel}</span>
                {matchedUser.nickname ? (
                  <span className="text-dim font-mono mt-0.5 block text-3xs">@{matchedUser.nickname}</span>
                ) : null}
              </p>
            ) : (
              <Input
                label="Name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                hint={phoneReady && !phoneLookup.isFetching ? 'Only needed when this number is new.' : undefined}
              />
            )}
          </Form>
        )}
      </DialogBody>

      {mode === 'new' ? (
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="add-quick-match-player" disabled={phoneReady && phoneLookup.isFetching}>
            Add Player
          </Button>
        </DialogFooter>
      ) : null}
    </BaseDialog>
  );
}
