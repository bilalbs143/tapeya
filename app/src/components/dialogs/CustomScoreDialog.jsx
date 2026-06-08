import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

export function CustomScoreDialog({ onSubmit }) {
  const { closeDialog } = useDialog();
  const [value, setValue] = useState('');

  const handleDone = () => {
    const n = parseInt(value.trim(), 10);
    if (Number.isNaN(n) || n < 0 || n > 99) return;
    onSubmit?.(n);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Add Score</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="flex flex-col">
        <FormField htmlFor="custom-score-input" label="Custom Score">
          <Input
            id="custom-score-input"
            type="number"
            min={0}
            max={99}
            placeholder="Enter Custom Score"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-no-spinner !border-brand !mb-0"
          />
        </FormField>
      </DialogScrollBody>
      <DialogSaveButton disabled={!String(value).trim()} onClick={handleDone}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default CustomScoreDialog;
