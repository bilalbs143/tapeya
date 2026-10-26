import { useState } from 'react';

import { isValidNational, PhoneField, toE164 } from '@/features/auth';
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
  const [dial, setDial] = useState('+92');
  const [national, setNational] = useState('');
  const [error, setError] = useState<string | null>(null);
  const taken = new Set(takenIds);
  const query = search.trim();
  const mine = useLookupMyUsersQuery(undefined, { skip: !open || mode !== 'find' || query.length >= 2 });
  const found = useLookupUsersQuery(query, { skip: !open || mode !== 'find' || query.length < 2 });
  const rows = (query.length >= 2 ? found.data : mine.data) ?? [];
  const loading = query.length >= 2 ? found.isFetching : mine.isFetching;

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
    const phone = toE164(dial, national);
    if (!isValidNational(national)) {
      setError('Enter the number without the country code, digits only.');
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
        <DialogDescription>Pick someone on Tapeya, or type a new name and phone.</DialogDescription>
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
            <Input label="Name" required value={name} onChange={(event) => setName(event.target.value)} />
            <PhoneField
              label="Phone Number"
              required
              dial={dial}
              onDialChange={setDial}
              value={national}
              onChange={(event) => setNational(event.target.value)}
              error={error ?? undefined}
            />
          </Form>
        )}
      </DialogBody>

      {mode === 'new' ? (
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="add-quick-match-player">
            Add Player
          </Button>
        </DialogFooter>
      ) : null}
    </BaseDialog>
  );
}
