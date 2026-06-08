import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Manages local value state; calls onSelect + closes on selection.
 */
export function PlayersPerSideDialog({ initialPlayersPerSide, options, onSelect }) {
  const { closeDialog } = useDialog();
  const [playersPerSide, setPlayersPerSide] = useState(initialPlayersPerSide ?? '');

  const handleSelect = (val) => {
    onSelect?.(val);
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
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const val = String(opt.value);
              const isSelected = playersPerSide === val;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(val)}
                  className={`flex w-full items-center rounded-full px-4 py-3 text-[14px] font-medium transition-colors focus:outline-none ${
                    isSelected ? 'bg-brand text-ink' : 'bg-surface text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleDone}>Done</DialogSaveButton>
    </>
  );
}

export default PlayersPerSideDialog;
