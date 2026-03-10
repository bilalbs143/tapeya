import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import { DialogTitle } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Overs selection dialog used in StartMatch.
 */
export function OversDialog({ open, onOpenChange, overs, options, onChange }) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <DialogTitle className="text-[14px] !font-bold tracking-wide text-[#DA9811] uppercase">
          Select Overs
        </DialogTitle>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Enter overs (e.g. 20)"
          value={overs ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-4 h-12 rounded-[6px] bg-[#141412] text-white placeholder:text-[#A2A6AB]"
          aria-label="Overs"
        />
        <div className="mt-4">
          <ToggleGroup
            type="single"
            value={overs}
            onValueChange={(v) => {
              if (v != null && v !== '') {
                onChange(String(v));
                onOpenChange(false);
              }
            }}
            className="flex cursor-pointer flex-wrap gap-2"
          >
            {options.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={String(opt.value)}
                className="cursor-pointer"
                aria-label={`${opt.label} overs`}
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="mt-6">
          <Button
            type="button"
            variant="orange"
            className="w-full cursor-pointer !bg-[#DA9811] !text-[#080807]"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

export default OversDialog;
