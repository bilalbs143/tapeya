import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { Button } from '@/ui/Button';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogTitle,
} from '@/ui/Dialog';
import { Input } from '@/ui/Input';

/**
 * Players-per-side (wickets) selection dialog used in StartMatch.
 */
export function PlayersPerSideDialog({
  open,
  onOpenChange,
  playersPerSide,
  options,
  onSelect,
}) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col">
        <DialogHeaderRow>
          <DialogTitle className={dialogPrimaryTitleClass}>
            Select Players Per Side
          </DialogTitle>
        </DialogHeaderRow>
        <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter number (e.g. 11)"
            value={playersPerSide ?? ''}
            onChange={(e) => onSelect(e.target.value)}
            className="mt-4 h-12 rounded-[6px] bg-[#141412] text-white placeholder:text-[#A2A6AB]"
            aria-label="Players per side"
          />
          <div className="mt-5 flex flex-col gap-2">
            {options.map((opt) => {
              const val = String(opt.value);
              const isSelected = playersPerSide === val;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelect(val);
                    onOpenChange(false);
                  }}
                  className={`flex w-full cursor-pointer items-center rounded-full px-4 py-3 text-base text-[14px] font-medium transition-colors focus:outline-none ${
                    isSelected
                      ? 'bg-[#DA9811] text-[#080807]'
                      : 'bg-[#141412] text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
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
      </div>
    </BaseDialog>
  );
}

export default PlayersPerSideDialog;
