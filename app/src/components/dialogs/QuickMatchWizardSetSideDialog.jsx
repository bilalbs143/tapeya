import { useMemo, useState } from 'react';

import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { FORM_FIELD_ERROR_CLASS } from '@/lib/constants/formLayout';
import { useSearchTeamsQuery } from '@/store/api/teamApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Wizard: set one side via saved team list or a new team name.
 * Props: sideLabel, excludeTeamId?, initialMode?, initialName?, onSelectSaved(team), onSelectNew(name)
 */
export function QuickMatchWizardSetSideDialog({
  sideLabel = 'Side',
  excludeTeamId = null,
  initialMode = 'saved',
  initialName = '',
  onSelectSaved,
  onSelectNew,
}) {
  const { closeDialog } = useDialog();
  const [mode, setMode] = useState(initialMode === 'new' ? 'new' : 'saved');
  const [teamName, setTeamName] = useState(initialName ?? '');
  const [error, setError] = useState('');

  // Cache is warmed on /quick-match so Saved Team list is usually instant.
  const { data: ownedTeams = [], isFetching } = useSearchTeamsQuery({ mine: true });

  const teams = useMemo(() => {
    const exclude = excludeTeamId != null ? Number(excludeTeamId) : null;
    return (ownedTeams ?? [])
      .filter((t) => t?.id != null && (exclude == null || Number(t.id) !== exclude))
      .slice()
      .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, { sensitivity: 'base' }));
  }, [ownedTeams, excludeTeamId]);

  const canSaveNew = Boolean(teamName.trim());

  const pickSaved = (team) => {
    if (!team?.id) return;
    onSelectSaved?.(team);
    closeDialog();
  };

  const saveNew = () => {
    setError('');
    const n = teamName.trim();
    if (n.length < 2) {
      setError('Enter a team name (at least 2 characters).');
      return;
    }
    onSelectNew?.(n);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Set {sideLabel}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => {
              if (!v) return;
              setMode(v);
              setError('');
            }}
            className="flex gap-2"
          >
            <ToggleGroupItem value="saved" className="flex-1" aria-label="Use Saved Team">
              Saved Team
            </ToggleGroupItem>
            <ToggleGroupItem value="new" className="flex-1" aria-label="New Team">
              New Team
            </ToggleGroupItem>
          </ToggleGroup>

          {mode === 'saved' ? (
            <FormStack density="compact">
              {isFetching ? (
                <p className="text-muted text-[13px]">Loading teams…</p>
              ) : teams.length === 0 ? (
                <p className="text-muted text-[13px]">No owned teams yet. Use New Team to create one.</p>
              ) : (
                teams.map((team) => {
                  const name = team.name ?? `Team ${team.id}`;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => pickSaved(team)}
                      className="bg-surface flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[14px] font-medium text-white transition-colors focus:outline-none active:opacity-90"
                    >
                      <TeamLogo team={team} variant="dialogSelect" />
                      {name}
                    </button>
                  );
                })
              )}
            </FormStack>
          ) : (
            <>
              <FormField label="Team Name" htmlFor="qm-wizard-team-name" required>
                <Input
                  id="qm-wizard-team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="E.g. Street XI"
                />
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

      {mode === 'new' ? (
        <DialogSaveButton disabled={!canSaveNew} onClick={saveNew}>
          Set {sideLabel}
        </DialogSaveButton>
      ) : null}
    </>
  );
}

export default QuickMatchWizardSetSideDialog;
