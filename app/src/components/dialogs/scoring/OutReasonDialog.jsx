import { Dialog, DialogContent } from '@/ui/Dialog';

export function OutReasonDialog({
  open,
  onOpenChange,
  dismissalOptions,
  onSelectOption,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="out-reason-sheet !fixed !top-auto !right-0 !bottom-0 !left-0 max-h-[85vh] !w-full !max-w-none !translate-x-0 !translate-y-0 rounded-t-3xl !bg-[#141412] p-5 pb-8"
        aria-describedby={undefined}
      >
        <div className="flex flex-wrap gap-2 overflow-y-auto">
          {dismissalOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectOption(opt)}
              className="flex-grow cursor-pointer rounded-[6px] bg-[black] px-3 py-3 text-center text-[10px] font-medium text-white transition-opacity hover:bg-[#1a1a18] hover:opacity-95 active:opacity-90"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OutReasonDialog;
