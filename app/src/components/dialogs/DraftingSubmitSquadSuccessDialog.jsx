import { DialogClose, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export function DraftingSubmitSquadSuccessDialog({ teamName }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span aria-hidden className="w-5" />
        <DialogClose
          className="rounded p-1 text-white/60 ring-0 transition-colors outline-none hover:text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
          </svg>
        </DialogClose>
      </div>

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
