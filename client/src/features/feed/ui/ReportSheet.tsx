import { type FormEvent, useState } from 'react';

import { type SafetyReportReason, useReportUserMutation } from '@/features/explore';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Field, FieldMessage } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { CheckIcon } from '@/shared/ui/icons';
import { Textarea } from '@/shared/ui/Input';
import { Radio, RadioGroup } from '@/shared/ui/RadioGroup';

import { type ReportReason, useReportPostMutation } from '../api/feedApi';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'violence', label: 'Violence' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'other', label: 'Other' },
];

type ReportSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Noun in titles — “Report post” / “Report reel” / “Report user”. */
  subject?: 'post' | 'reel' | 'user' | undefined;
  /** Post or reel id when `subject` is post/reel. */
  postId?: number | null | undefined;
  /** User id when `subject` is user. */
  userId?: number | null | undefined;
};

/** Report post/reel (`POST /posts/{id}/report`) or user (`POST /users/{id}/report`). */
export function ReportSheet({ open, onOpenChange, subject = 'post', postId = null, userId = null }: ReportSheetProps) {
  const [reportPost, { isLoading: reportingPost }] = useReportPostMutation();
  const [reportUser, { isLoading: reportingUser }] = useReportUserMutation();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUser = subject === 'user';
  const noun = subject === 'reel' ? 'reel' : subject === 'user' ? 'user' : 'post';
  const targetId = isUser ? userId : postId;
  const enabled = open && targetId != null && targetId > 0;
  const isLoading = reportingPost || reportingUser;

  function reset() {
    setReason('spam');
    setDetails('');
    setDone(false);
    setError(null);
  }

  function close(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!enabled || targetId == null) return;
    setError(null);
    try {
      if (isUser) {
        await reportUser({
          userId: targetId,
          reason: reason as SafetyReportReason,
          details: details.trim() || undefined,
        }).unwrap();
      } else {
        await reportPost({
          postId: targetId,
          reason,
          details: details.trim() || undefined,
        }).unwrap();
      }
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit report.'));
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={close}
      sheet
      showClose={!done}
      contentClassName="flex max-h-[min(92dvh,640px)] flex-col p-0"
    >
      {done ? (
        <>
          <DialogHeader className="items-center pr-5 text-center">
            <span
              className="bg-brand/15 text-brand-text mb-1 grid h-14 w-14 place-items-center rounded-full"
              aria-hidden
            >
              <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <DialogTitle>Thanks for Reporting</DialogTitle>
            <DialogDescription>
              Our team aims to review this {noun} within 24 hours and take action if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => close(false)}>
              Done
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogHeader className="pr-5">
            <DialogTitle>Report {noun === 'user' ? 'User' : noun}</DialogTitle>
            <DialogDescription>Tell us what’s wrong. Reports are anonymous.</DialogDescription>
          </DialogHeader>

          <Form id="report-form" density="compact" onSubmit={(e) => void submit(e)}>
            <DialogBody className="gap-3.5 overflow-y-auto">
              <Field label="Reason" required>
                {() => (
                  <RadioGroup
                    value={reason}
                    onValueChange={(v) => setReason(v as ReportReason)}
                    aria-label="Report Reason"
                    className="gap-0"
                  >
                    {REASONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'border-border-subtle flex cursor-pointer items-center gap-3 border-b py-3 last:border-b-0'
                        )}
                      >
                        <Radio value={opt.value} />
                        <span className="text-ink text-sm font-semibold">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </Field>

              <Textarea
                label="Details"
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
                placeholder="Add anything that helps us review this…"
                rows={3}
                maxLength={1000}
              />

              <FieldMessage error={error ?? undefined} />
            </DialogBody>
          </Form>

          <DialogFooter>
            <Button type="submit" form="report-form" loading={isLoading} disabled={!enabled}>
              Submit Report
            </Button>
          </DialogFooter>
        </>
      )}
    </BaseDialog>
  );
}
