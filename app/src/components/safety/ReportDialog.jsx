/**
 * Shared report sheet for posts, reels, and users (App Store 1.2).
 * Reels are posts on the API — both use POST /posts/{id}/report.
 */

import { useState } from 'react';

import { useReportPostMutation, useReportUserMutation } from '@/store/api/userApi';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { FormStack } from '@/ui/form/FormStack';
import { RadioOptionList } from '@/ui/RadioOptionList';
import { Textarea } from '@/ui/Textarea';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'violence', label: 'Violence' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'other', label: 'Other' },
];

const TITLES = {
  post: 'Report Post',
  reel: 'Report Reel',
  user: 'Report User',
};

const THANKS_COPY = {
  post: 'Our team reviews reports and aims to act within 24 hours when content violates our Terms.',
  reel: 'Our team reviews reports and aims to act within 24 hours when content violates our Terms.',
  user: 'Our team reviews reports and aims to act within 24 hours when a user violates our Terms.',
};

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

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   targetType: 'post' | 'reel' | 'user',
 *   targetId: number|string,
 *   title?: string,
 * }} props
 */
export default function ReportDialog({ open, onClose, targetType, targetId, title }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [reportPost, { isLoading: reportingPost }] = useReportPostMutation();
  const [reportUser, { isLoading: reportingUser }] = useReportUserMutation();
  const isLoading = reportingPost || reportingUser;
  const formId = `report-form-${targetType}`;
  const detailsId = `report-details-${targetType}`;

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
    const payload = { reason, details: details.trim() || undefined };
    try {
      if (targetType === 'user') {
        await reportUser({ userId: targetId, ...payload }).unwrap();
      } else {
        // post + reel share the same posts/{id}/report endpoint
        await reportPost({ postId: targetId, ...payload }).unwrap();
      }
      setDone(true);
    } catch (err) {
      setError(
        err?.data?.message || err?.data?.errors?.reason?.[0] || err?.data?.errors?.post?.[0] || 'Could not submit report.',
      );
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={title || TITLES[targetType] || 'Report'}
      footer={
        done ? (
          <Button
            type="button"
            variant="orange"
            onClick={() => handleOpenChange(false)}
            className="w-full rounded-full px-4 py-3 text-sm"
          >
            Done
          </Button>
        ) : (
          <Button
            type="submit"
            variant="orange"
            form={formId}
            disabled={isLoading || !reason}
            loading={isLoading}
            className="w-full rounded-full px-4 py-3 text-sm"
          >
            Submit Report
          </Button>
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
            {THANKS_COPY[targetType] || THANKS_COPY.post}
          </p>
        </div>
      ) : (
        <FormStack as="form" id={formId} onSubmit={handleSubmit} density="default">
          <div>
            <p className="text-muted mb-2.5 text-[12px] font-semibold tracking-wide uppercase">Reason</p>
            <RadioOptionList options={REPORT_REASONS} value={reason} onChange={setReason} ariaLabel="Report reason" />
          </div>

          <div>
            <label htmlFor={detailsId} className="text-muted mb-2 block text-[12px] font-semibold tracking-wide uppercase">
              Details (Optional)
            </label>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
              <Textarea
                id={detailsId}
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
