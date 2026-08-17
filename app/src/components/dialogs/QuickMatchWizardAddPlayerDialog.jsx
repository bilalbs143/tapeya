import { useMemo, useState } from 'react';

import { PlayerSearchResultRow } from '@/components/PlayerSearchResultRow';
import { useDialog } from '@/context/DialogContext';
import { useDebounce } from '@/hooks/useDebounce';
import { FORM_FIELD_ERROR_CLASS, FORM_HELPER_TEXT_CLASS } from '@/lib/constants/formLayout';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { validateWalkUpPlayer } from '@/lib/validations/quickMatchWalkUp';
import { useLookupUsersQuery } from '@/store/api/userApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

const searchResultsClass = 'bg-surface max-h-48 overflow-auto rounded-[6px] border border-[#141412] shadow-lg';

/**
 * Wizard / resume: add a player (your players, search Tapeya, or walk-up).
 * Props: sideLabel, blockedUserIds, initialMode ('find' | 'walkup'), onAdd(player) — may return a Promise
 */
export function QuickMatchWizardAddPlayerDialog({ sideLabel = 'Side', blockedUserIds = [], initialMode = 'find', onAdd }) {
  const { closeDialog } = useDialog();
  const [mode, setMode] = useState(initialMode === 'walkup' ? 'walkup' : 'find');
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+92');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, DEBOUNCE_MS);

  const { data: myPlayersRaw = [], isFetching: loadingMine } = useLookupUsersQuery({ mine: true }, { skip: mode !== 'find' });
  const { data: searchResults = [], isFetching: searching } = useLookupUsersQuery(
    { search: debounced },
    { skip: mode !== 'find' || debounced.length < MIN_SEARCH_LENGTH },
  );

  const blocked = useMemo(() => new Set(blockedUserIds.map(Number)), [blockedUserIds]);

  const myPlayers = useMemo(
    () =>
      (myPlayersRaw ?? [])
        .filter((p) => p.id != null && !blocked.has(Number(p.id)))
        .slice()
        .sort((a, b) =>
          String(a.name ?? a.nickname ?? '').localeCompare(String(b.name ?? b.nickname ?? ''), undefined, {
            sensitivity: 'base',
          }),
        ),
    [myPlayersRaw, blocked],
  );

  const candidates = useMemo(
    () => (searchResults ?? []).filter((p) => p.id != null && !blocked.has(Number(p.id))),
    [searchResults, blocked],
  );

  const canSaveWalkUp = Boolean(name.trim() && phone) && !saving;

  const commitAdd = async (player) => {
    setSaving(true);
    setError('');
    try {
      await Promise.resolve(onAdd?.(player));
      closeDialog();
    } catch (err) {
      const msg =
        (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string' ? err.message : null) ||
        'Could not add player.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const addExisting = (user) => {
    if (!user?.id || blocked.has(Number(user.id)) || saving) return;
    void commitAdd({
      user_id: Number(user.id),
      name: user.name ?? user.nickname ?? 'Player',
      nickname: user.nickname,
    });
  };

  const addWalkUp = () => {
    const result = validateWalkUpPlayer(name, phone);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    void commitAdd({ name: result.name, phone: result.phone });
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Add To {sideLabel}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => {
              if (!v || saving) return;
              setMode(v);
              setError('');
            }}
            className="flex gap-2"
          >
            <ToggleGroupItem value="find" className="flex-1" aria-label="Find Player">
              Find Player
            </ToggleGroupItem>
            <ToggleGroupItem value="walkup" className="flex-1" aria-label="Create New Player">
              Create New Player
            </ToggleGroupItem>
          </ToggleGroup>

          {mode === 'find' ? (
            <>
              <FormStack density="compact">
                <p className="text-muted text-[12px] font-bold tracking-wide uppercase">Your Players</p>
                {loadingMine ? (
                  <p className="text-muted text-[13px]">Loading players…</p>
                ) : myPlayers.length === 0 ? (
                  <p className="text-muted text-[13px]">No players added yet.</p>
                ) : (
                  myPlayers.map((p) => (
                    <PlayerSearchResultRow
                      key={p.id}
                      player={p}
                      variant="pill"
                      disabled={saving}
                      onClick={() => addExisting(p)}
                    />
                  ))
                )}
              </FormStack>

              <FormField label="Search Tapeya Users" htmlFor="qm-wizard-find">
                <Input
                  id="qm-wizard-find"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Tapeya Users"
                  disabled={saving}
                />
                {trimmed.length > 0 ? (
                  <div className={searchResultsClass}>
                    {debounced.length < MIN_SEARCH_LENGTH ? (
                      <p className="text-muted px-4 py-3 text-[13px]">Type at least {MIN_SEARCH_LENGTH} characters</p>
                    ) : searching ? (
                      <p className="text-muted px-4 py-3 text-[13px]">Searching…</p>
                    ) : candidates.length === 0 ? (
                      <p className="text-muted px-4 py-3 text-[13px]">No Players Found</p>
                    ) : (
                      <ul className="py-1">
                        {candidates.map((p) => (
                          <PlayerSearchResultRow key={p.id} player={p} disabled={saving} onClick={() => addExisting(p)} />
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className={FORM_HELPER_TEXT_CLASS}>Search to add someone who already has Tapeya.</p>
                )}
              </FormField>
              {error ? (
                <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                  {error}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <FormField label="Full Name" htmlFor="qm-wizard-walk-name" required>
                <Input id="qm-wizard-walk-name" value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
              </FormField>
              <FormField label="Phone" htmlFor="qm-wizard-walk-phone" required>
                <PhoneInput id="qm-wizard-walk-phone" value={phone} onChange={setPhone} readOnly={saving} />
              </FormField>
              {error ? (
                <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </FormStack>
      </DialogScrollBody>

      {mode === 'walkup' ? (
        <DialogSaveButton disabled={!canSaveWalkUp} onClick={addWalkUp} className="disabled:!bg-white/10 disabled:!text-white/40">
          {saving ? 'Adding…' : `Add To ${sideLabel}`}
        </DialogSaveButton>
      ) : null}
    </>
  );
}

export default QuickMatchWizardAddPlayerDialog;
