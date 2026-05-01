import {
  Dialog,
  DialogContent,
  DialogHeaderRow,
  DialogTitle,
} from '@/ui/Dialog';

export function OutReasonDialog({
  open,
  onOpenChange,
  dismissalOptions,
  onSelectOption,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="out-reason-sheet !fixed !top-auto !right-0 !bottom-0 !left-0 max-h-[85vh] !w-auto !max-w-none !translate-x-0 !translate-y-0 rounded-t-3xl !bg-[#141412] px-0 pb-8 pt-2 lg:!left-[280px]"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Select dismissal reason</DialogTitle>
        <DialogHeaderRow reserveCloseSpace={false} />
        <div className="grid max-h-[min(70vh,calc(85vh-5rem))] w-full min-w-0 grid-cols-2 gap-2 overflow-x-hidden overflow-y-auto px-5 pb-5 sm:grid-cols-3 lg:grid-cols-4">
          {dismissalOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectOption(opt)}
              className="cursor-pointer rounded-[6px] bg-[black] px-3 py-3 text-center text-[10px] font-medium text-white transition-opacity hover:bg-[#1a1a18] hover:opacity-95 active:opacity-90"
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
