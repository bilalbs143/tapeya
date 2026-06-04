import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
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

      <DialogScrollBody className="flex flex-col gap-4">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Enter Overs (e.g. 20)"
          value={overs}
          onChange={(e) => setOvers(e.target.value)}
          className="h-12 rounded-[6px] bg-[#141412] text-white placeholder:text-[#A2A6AB]"
          aria-label="Overs"
        />
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
      </DialogScrollBody>

      <DialogSaveButton onClick={handleDone}>Done</DialogSaveButton>
    </>
  );
}

export default OversDialog;
