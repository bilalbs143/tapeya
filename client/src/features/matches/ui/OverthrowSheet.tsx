import { useState } from 'react';

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
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { EXTRA_RUN_OPTIONS } from '../lib/extraRunOptions';
import { overthrowDialogTitle, overthrowSelectionToUiFields } from '../lib/overthrowExtras';
import type { UiBall } from '../lib/storeBallPayload';

type OverthrowSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-lock delivery type from overflow (wide | no_ball). */
  initialDeliveryType?: string | null | undefined;
  onConfirm: (ball: Pick<UiBall, 'type' | 'overthrowDeliveryType' | 'overthrowRuns'>) => void;
};

export function OverthrowSheet({ open, onOpenChange, initialDeliveryType = null, onConfirm }: OverthrowSheetProps) {
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  const deliveryOptions = enumOptions(enums, 'overthrow_delivery_type');
  const locked = Boolean(initialDeliveryType);
  const [deliveryType, setDeliveryType] = useState<string | null>(initialDeliveryType);
  const [runs, setRuns] = useState(0);

  // Reset on open or delivery-type lock change — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialDeliveryType, setPrevInitialDeliveryType] = useState(initialDeliveryType);
  if (open !== prevOpen || initialDeliveryType !== prevInitialDeliveryType) {
    setPrevOpen(open);
    setPrevInitialDeliveryType(initialDeliveryType);
    if (open) {
      setDeliveryType(initialDeliveryType);
      setRuns(0);
    }
  }

  // Once the delivery-type options load, pick a default when nothing is
  // locked in or chosen yet. Safe to set directly during render: once
  // `deliveryType` is non-null this condition is false.
  if (open && !locked && deliveryType == null && deliveryOptions[0]) {
    setDeliveryType(deliveryOptions[0].value);
  }

  const selectedLabel = deliveryOptions.find((o) => o.value === deliveryType)?.label ?? deliveryType;

  function reset() {
    setDeliveryType(initialDeliveryType);
    setRuns(0);
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogHeader>
        <DialogTitle>{overthrowDialogTitle(initialDeliveryType)}</DialogTitle>
        <DialogDescription>
          {locked
            ? `Delivery: ${selectedLabel ?? initialDeliveryType}. Pick overthrow runs.`
            : 'Choose the delivery context, then how many overthrow runs.'}
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        {isError ? (
          <ErrorState title="Couldn’t Load Delivery Types" onRetry={() => void refetch()} />
        ) : isLoading && deliveryOptions.length === 0 ? (
          <Skeleton className="h-11 w-full rounded-panel" aria-label="Loading" />
        ) : (
          <>
            {!locked ? (
              <div className="flex flex-wrap gap-2">
                {deliveryOptions.map((opt) => {
                  const selected = deliveryType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setDeliveryType(opt.value)}
                      className={cn(
                        'min-h-10 rounded-field border px-3 text-2xs font-bold',
                        selected
                          ? 'border-brand bg-brand/12 text-brand-text'
                          : 'border-border-subtle bg-surface text-ink'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {EXTRA_RUN_OPTIONS.map((value) => {
                const selected = runs === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRuns(value)}
                    className={cn(
                      'font-mono min-h-11 min-w-11 rounded-panel border text-sm font-extrabold',
                      selected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-ink'
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            onOpenChange(false);
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!deliveryType}
          onClick={() => {
            if (!deliveryType) return;
            onConfirm(overthrowSelectionToUiFields({ deliveryType, runs }));
            reset();
            onOpenChange(false);
          }}
        >
          Confirm
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
