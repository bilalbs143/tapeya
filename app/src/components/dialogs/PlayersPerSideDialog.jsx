import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Manages local value state; calls onSelect + closes on selection.
 * Same input + preset-grid pattern as OversDialog.
 */
export function PlayersPerSideDialog({ initialPlayersPerSide, options, onSelect }) {
  const { closeDialog } = useDialog();
  const [playersPerSide, setPlayersPerSide] = useState(initialPlayersPerSide != null ? String(initialPlayersPerSide) : '');

  const handlePreset = (v) => {
    onSelect?.(v);
    closeDialog();
  };

  const handleDone = () => {
    if (playersPerSide) onSelect?.(playersPerSide);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Select Players Per Side</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <FormField label="Players Per Side" htmlFor="players-per-side-input">
            <Input
              id="players-per-side-input"
              type="text"
              inputMode="numeric"
              placeholder="Enter Number (e.g. 11)"
              value={playersPerSide}
              onChange={(e) => setPlayersPerSide(e.target.value)}
            />
          </FormField>
          <ToggleGroup
            type="single"
            value={playersPerSide}
            onValueChange={(v) => {
              if (v != null && v !== '') handlePreset(v);
            }}
            className="flex flex-wrap gap-2"
          >
            {options.map((opt) => (
              <ToggleGroupItem key={opt.value} value={String(opt.value)} aria-label={`${opt.label} players per side`}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleDone}>Done</DialogSaveButton>
    </>
  );
}

export default PlayersPerSideDialog;
