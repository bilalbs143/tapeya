import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Pick a cricket / ball format from enum options (same UX as Overs / Players Per Side).
 */
export function BallTypeDialog({ initialValue, options = [], onSelect, title = 'Select Ball Type' }) {
  const { closeDialog } = useDialog();
  const [value, setValue] = useState(initialValue != null ? String(initialValue) : '');

  const handleSelect = (next) => {
    onSelect?.(next);
    closeDialog();
  };

  const handleDone = () => {
    if (value) onSelect?.(value);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const val = String(opt.value);
              const isSelected = value === val;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValue(val);
                    handleSelect(val);
                  }}
                  className={`flex w-full items-center rounded-full px-4 py-3 text-[14px] font-medium transition-colors focus:outline-none ${
                    isSelected ? 'bg-brand text-ink' : 'bg-surface text-white'
                  }`}
                >
                  {opt.label ?? opt.value}
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

export default BallTypeDialog;
