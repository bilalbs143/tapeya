import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export function OutReasonDialog({ dismissalOptions = [], onSelectOption }) {
  const { closeDialog } = useDialog();
  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>How was the batter out?</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="pb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {dismissalOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                closeDialog();
                onSelectOption?.(opt);
              }}
              className="cursor-pointer rounded-[6px] bg-black px-3 py-3 text-center text-[10px] font-medium text-white transition-opacity hover:bg-[#1a1a18] hover:opacity-95 active:opacity-90"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </DialogScrollBody>
    </>
  );
}

export default OutReasonDialog;
