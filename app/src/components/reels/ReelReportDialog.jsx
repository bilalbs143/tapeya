/**
 * Report reel — dark bottom sheet aligned with ReelCommentsSheet.
 */

import { useState } from 'react';

import { useReportReelMutation } from '@/store/api/reelsApi';
import { BottomSheet } from '@/ui/BottomSheet';
import { FormStack } from '@/ui/form/FormStack';
import { Loader } from '@/ui/Loader';
import { RadioOptionList } from '@/ui/RadioOptionList';
import { Textarea } from '@/ui/Textarea';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'violence', label: 'Violence' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'other', label: 'Other' },
];

function CheckIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function ReelReportDialog({ reelId, open, onClose }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [reportReel, { isLoading }] = useReportReelMutation();

  const reset = () => {
    setDone(false);
    setError('');
    setDetails('');
    setReason('spam');
  };

  const handleOpenChange = (next) => {
    if (!next) {
      reset();
      onClose?.();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await reportReel({
        id: reelId,
        reason,
        details: details.trim() || undefined,
      }).unwrap();
      setDone(true);
    } catch (err) {
      const msg =
        err?.data?.message || err?.data?.errors?.reel?.[0] || err?.data?.errors?.reason?.[0] || 'Could not submit report.';
      setError(msg);
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Report Reel"
      footer={
        done ? (
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="bg-brand text-ink w-full rounded-full px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
          >
            Done
          </button>
        ) : (
          <button
            type="submit"
            form="reel-report-form"
            disabled={isLoading || !reason}
            className="bg-brand text-ink flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader size="xs" tone="ink" /> : null}
            {isLoading ? 'Submitting…' : 'Submit Report'}
          </button>
        )
      }
    >
      {done ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="bg-brand/15 text-brand mb-4 flex size-14 items-center justify-center rounded-full">
            <CheckIcon />
          </div>
          <p className="text-[15px] font-semibold text-white">Thanks for Reporting</p>
          <p className="text-muted mt-1.5 max-w-[260px] text-[13px] leading-relaxed">
            Our team will review this reel and take action if needed.
          </p>
        </div>
      ) : (
        <FormStack as="form" id="reel-report-form" onSubmit={handleSubmit} density="default">
          <div>
            <p className="text-muted mb-2.5 text-[12px] font-semibold tracking-wide uppercase">Reason</p>
            <RadioOptionList options={REASONS} value={reason} onChange={setReason} ariaLabel="Report reason" />
          </div>

          <div>
            <label
              htmlFor="reel-report-details"
              className="text-muted mb-2 block text-[12px] font-semibold tracking-wide uppercase"
            >
              Details (Optional)
            </label>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
              <Textarea
                id="reel-report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add anything that helps us review this…"
                rows={3}
                maxLength={1000}
                className="min-h-[72px]! resize-none! rounded-none! border-0! bg-transparent! px-0! py-1! text-sm text-white placeholder:text-white/35 focus:ring-0!"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </FormStack>
      )}
    </BottomSheet>
  );
}
