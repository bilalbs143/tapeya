import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Manages local overs state; calls onChange + closes on confirm/preset.
 */
export function OversDialog({ initialOvers, options, onChange }) {
  const { closeDialog } = useDialog();
  const [overs, setOvers] = useState(initialOvers ?? '');

  const handlePreset = (v) => {
    onChange?.(String(v));
    closeDialog();
  };

  const handleDone = () => {
    if (overs) onChange?.(overs);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Select Overs</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <FormField label="Overs" htmlFor="overs-input">
            <Input
              id="overs-input"
              type="text"
              inputMode="numeric"
              placeholder="Enter Overs (e.g. 20)"
              value={overs}
              onChange={(e) => setOvers(e.target.value)}
            />
          </FormField>
          <ToggleGroup
            type="single"
            value={overs}
            onValueChange={(v) => {
              if (v != null && v !== '') handlePreset(v);
            }}
            className="flex flex-wrap gap-2"
          >
            {options.map((opt) => (
              <ToggleGroupItem key={opt.value} value={String(opt.value)} aria-label={`${opt.label} overs`}>
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

export default OversDialog;
