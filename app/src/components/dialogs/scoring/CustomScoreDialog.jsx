import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormField, formFieldLabelEditClass } from '@/ui/FormField';
import { Input } from '@/ui/Input';

export function CustomScoreDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
}) {
  const handleDone = () => {
    onSubmit();
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeaderRow hideClose>
        <DialogTitle className={dialogPrimaryTitleClass}>Add Score</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="flex flex-col">
        <FormField
          htmlFor="custom-score-input"
          label="Custom score"
          className="space-y-2"
          labelClassName={formFieldLabelEditClass}
        >
          <Input
            id="custom-score-input"
            type="number"
            min={0}
            max={99}
            placeholder="Enter custom score"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-no-spinner !mb-0 !border-[#DA9811]"
          />
        </FormField>
      </DialogScrollBody>
      <div className="shrink-0 px-5 pt-4 pb-5">
        <Button
          type="button"
          variant="orangeDialog"
          size="dialog"
          disabled={!String(value).trim()}
          onClick={handleDone}
        >
          Done
        </Button>
      </div>
    </BaseDialog>
  );
}

export default CustomScoreDialog;
