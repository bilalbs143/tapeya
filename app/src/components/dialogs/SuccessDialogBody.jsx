import { DialogDescription, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

function SuccessIcon() {
  return (
    <div className="relative mb-4 flex h-16 w-16 shrink-0 items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
        <svg className="h-8 w-8 text-[#E8A857]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11V4a3 3 0 0 1 3-3h2v10z" />
        </svg>
      </div>
      <div className="bg-brand absolute -top-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full" aria-hidden>
        <svg
          className="text-ink h-4 w-4"
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
  );
}

/**
 * Shared body for success dialogs (Pricing, DraftingSubmitSquad).
 */
export function SuccessDialogBody({ title, description }) {
  return (
    <DialogScrollBody className="flex flex-col items-center justify-center py-2 text-center">
      <SuccessIcon />
      <DialogTitle className="mb-1.5 text-[14px] font-bold text-white">{title}</DialogTitle>
      {description != null && description !== '' ? (
        typeof description === 'string' ? (
          <DialogDescription className="text-muted text-[13px] leading-snug">{description}</DialogDescription>
        ) : (
          description
        )
      ) : null}
    </DialogScrollBody>
  );
}
