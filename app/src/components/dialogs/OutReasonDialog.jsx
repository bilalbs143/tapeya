import { DismissalGridIcon } from '@/components/scoring/dismissal-grid/DismissalGridIcon';
import { useDialog } from '@/context/DialogContext';
import { getDismissalGridIconKey } from '@/lib/utils/dismissalUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

function DismissalGridButton({ option, onSelect }) {
  const iconKey = getDismissalGridIconKey(option);
  const isShortcut = Boolean(option.gridShortcut);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(option)}
      className={`flex flex-col items-center gap-2 rounded-[10px] px-2 py-3 text-center transition-opacity hover:opacity-95 active:opacity-90 ${
        isShortcut ? 'border-brand/50 bg-surface border' : 'bg-surface'
      }`}
    >
      <span className="text-brand flex h-12 w-12 items-center justify-center rounded-full bg-[#10100F]">
        <DismissalGridIcon iconKey={iconKey} />
      </span>
      <span className={`max-w-full text-[9px] leading-tight font-semibold ${isShortcut ? 'text-brand' : 'text-white'}`}>
        {option.label}
      </span>
    </button>
  );
}

export function OutReasonDialog({ dismissalOptions = [], onSelectOption, title = 'Select Out Action', subtitle }) {
  const { closeDialog } = useDialog();

  const handleSelect = (opt) => {
    closeDialog();
    onSelectOption?.(opt);
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="pb-4">
        <FormStack density="compact">
          {subtitle ? (
            <DialogFormSection label={subtitle} controlOffset="md">
              <div className="grid grid-cols-3 gap-2">
                {dismissalOptions.map((opt) => (
                  <DismissalGridButton key={opt.value} option={opt} onSelect={handleSelect} />
                ))}
              </div>
            </DialogFormSection>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {dismissalOptions.map((opt) => (
                <DismissalGridButton key={opt.value} option={opt} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </FormStack>
      </DialogScrollBody>
    </>
  );
}

export default OutReasonDialog;
