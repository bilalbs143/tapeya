import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

export function DraftingSubmitSquadSuccessDialog({ teamName }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          Squad Submitted
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col items-center justify-center py-2 text-center">
        <div className="relative mb-3 flex h-14 w-14 shrink-0 items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
            <svg
              className="h-7 w-7 text-[#E8A857]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11V4a3 3 0 0 1 3-3h2v10z" />
            </svg>
          </div>
          <div
            className="absolute -top-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]"
            aria-hidden
          >
            <svg
              className="h-3 w-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        <DialogTitle className="mb-1.5 text-[14px] font-bold text-white">
          Team has been submitted
        </DialogTitle>
        <p className="text-[13px] leading-snug text-[#A2A6AB]">
          {teamName
            ? `If you need any changes for ${teamName}, please contact the organizer.`
            : 'If you need any changes please contact organizer.'}
        </p>
      </DialogScrollBody>
    </div>
  );
}

export default DraftingSubmitSquadSuccessDialog;
