import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import { DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormField, formFieldLabelCheckoutClass } from '@/ui/FormField';
import { Input } from '@/ui/Input';

/**
 * Dialog to create or edit a team name (Start Match – no tournament flow).
 * Uses open/onOpenChange like other scoring dialogs.
 */
export function TeamNameDialog({
  open,
  onOpenChange,
  title,
  value,
  onChange,
  onSubmit,
}) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 px-5 pt-4">
          <DialogTitle className="text-[14px] !font-bold tracking-wide text-[#FF9700] uppercase">
            {title}
          </DialogTitle>
        </div>

        <DialogScrollBody className="flex flex-col gap-4">
          <FormField
            htmlFor="team-name"
            label="Team Name"
            labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
          >
            <Input
              id="team-name"
              placeholder="Create a Team Name"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="!mb-0"
            />
          </FormField>
        </DialogScrollBody>

        <div className="shrink-0 px-5 pt-2 pb-5">
          <Button
            type="button"
            variant="orange"
            className="w-full cursor-pointer"
            onClick={onSubmit}
          >
            Create Team
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

export default TeamNameDialog;
