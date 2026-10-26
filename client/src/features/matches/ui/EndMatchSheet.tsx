import { useId, useState } from 'react';

import { useGetEnumsQuery } from '@/shared/api/enumsApi';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { enumOptions } from '@/shared/model/enums';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Textarea } from '@/shared/ui/Input';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { Switch } from '@/shared/ui/Switch';

type EndMatchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oversDisplay: string | null;
  saving?: boolean | undefined;
  onConfirm: (payload: { cancelReason: string; cancelComments: string; cancelPointsAwardedEach: boolean }) => void;
};

/** Cancel Match follow-up — reason + comments (app EndMatchDialog contract). Typed confirm already ran in MatchActionMenu. */

export function EndMatchSheet({ open, onOpenChange, oversDisplay, saving = false, onConfirm }: EndMatchSheetProps) {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery(undefined, { skip: !open });
  const reasons = enumOptions(enums, 'match_end_reason');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [pointsEach, setPointsEach] = useState(false);
  const pointsEachId = useId();

  // Reset on open — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReason(reasons[0]?.value ?? '');
      setComments('');
      setPointsEach(false);
    }
  }

  // Reasons load asynchronously — seed the default once they arrive while the
  // sheet is still open and nothing has been picked yet. Safe to set directly
  // during render: once `reason` is non-empty this condition is false.
  if (open && !reason && reasons.length > 0) {
    setReason(reasons[0]?.value ?? '');
  }

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Cancel Match</DialogTitle>
        <DialogDescription>
          {oversDisplay ?? '0.0'} overs and the ball log are discarded. Pick why, then confirm.
        </DialogDescription>
      </DialogHeader>

      <Form
        id="end-match-form"
        density="compact"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason) return;
          onConfirm({
            cancelReason: reason,
            cancelComments: comments.trim(),
            cancelPointsAwardedEach: pointsEach,
          });
        }}
      >
        <DialogBody>
          {isError ? (
            <ErrorState title="Couldn’t Load Cancel Reasons" onRetry={() => void refetch()} />
          ) : isLoading && reasons.length === 0 ? (
            <Skeleton className="h-24 w-full rounded-field" />
          ) : (
            <Field label="Reason" required>
              <div className="flex flex-col gap-1.5">
                {reasons.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setReason(item.value)}
                    className={cn(
                      'focus-visible:outline-brand flex min-h-11 items-center gap-2.5 rounded-icon border px-3 text-left text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
                      reason === item.value
                        ? 'border-brand bg-surface text-ink'
                        : 'border-border-subtle bg-surface text-body'
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px]',
                        reason === item.value ? 'border-brand border-[4.5px]' : 'border-dim'
                      )}
                    />
                    {item.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <label
            htmlFor={pointsEachId}
            className="border-border-subtle bg-surface flex min-h-13 cursor-pointer items-center gap-3 rounded-field border px-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-ink">Award 1 point each</span>
              <span className="text-dim mt-0.5 block text-3xs">When the league needs a points split</span>
            </span>
            <Switch id={pointsEachId} checked={pointsEach} onCheckedChange={setPointsEach} />
          </label>

          <Textarea
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Ground unfit, both captains agreed…"
            className="min-h-15.5 text-2xs"
          />
        </DialogBody>
      </Form>

      <DialogFooter>
        <Button variant="secondary" size="md" disabled={saving} onClick={() => onOpenChange(false)}>
          Keep Scoring
        </Button>
        <Button type="submit" form="end-match-form" variant="danger" size="md" loading={saving} disabled={!reason}>
          Cancel Match
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
