import { useMemo, useState } from 'react';

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

export type ZonePending = {
  runs: number;
};

type ZonePickerSheetProps = {
  pending: ZonePending | null;
  strikerName?: string | null | undefined;
  onCommit: (result: ZonePending & { zone?: string | undefined }) => void;
};

function zoneLayout(count: number): { x: number; y: number }[] {
  if (count === 0) return [];
  const radius = 38;
  return Array.from({ length: count }, (_, i) => {
    const angle = ((-90 + (i * 360) / count) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  });
}

/** Zone values/labels from GET /enums → shot_position. */

export function ZonePickerSheet({ pending, strikerName, onCommit }: ZonePickerSheetProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery();
  const zones = enumOptions(enums, 'shot_position');
  const layout = useMemo(() => zoneLayout(zones.length), [zones.length]);

  if (!pending) return null;

  const skip = () => {
    setPicked(null);
    onCommit(pending);
  };

  const save = () => {
    const zone = picked ?? undefined;
    setPicked(null);
    onCommit(zone ? { ...pending, zone } : pending);
  };

  const zoneLabel = zones.find((z) => z.value === picked)?.label.toLowerCase();
  const strikerFirst = strikerName?.trim().split(/\s+/)[0];
  const meta = [
    `${pending.runs} run${pending.runs === 1 ? '' : 's'}`,
    strikerFirst ? `${strikerFirst} on strike` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <BaseDialog
      open
      onOpenChange={(open) => {
        if (!open) skip();
      }}
      showClose={false}
    >
      <DialogHeader>
        <DialogTitle>Where Did It Go?</DialogTitle>
        <DialogDescription className="font-mono text-3xs leading-normal font-medium uppercase">
          {meta}
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="items-center">
        {isError ? (
          <ErrorState title="Couldn’t Load Shot Zones" onRetry={() => void refetch()} />
        ) : isLoading && zones.length === 0 ? (
          <Skeleton className="aspect-square w-[212px] max-w-full rounded-full" />
        ) : (
          <div className="border-positive/50 bg-positive/10 relative aspect-square w-[212px] max-w-full rounded-full border-[1.5px]">
            <span className="border-positive/30 absolute inset-[34px] rounded-full border border-dashed" />
            <span className="bg-positive/30 absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2" />
            <span className="bg-positive/30 absolute top-1/2 right-0 left-0 h-px -translate-y-1/2" />
            <span className="bg-positive/20 absolute top-0 bottom-0 left-1/2 w-px origin-center -translate-x-1/2 rotate-45" />
            <span className="bg-positive/20 absolute top-0 bottom-0 left-1/2 w-px origin-center -translate-x-1/2 -rotate-45" />
            <span className="bg-body absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />

            {zones.map((zone, index) => {
              const pos = layout[index] ?? { x: 50, y: 50 };
              const short = zone.label
                .split(/\s+/)
                .map((w) => w.slice(0, 4))
                .join('\n');
              return (
                <button
                  key={zone.value}
                  type="button"
                  onClick={() => setPicked(zone.value)}
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                  aria-pressed={picked === zone.value}
                  aria-label={zone.label}
                  className={cn(
                    'absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center text-4xs leading-none font-extrabold uppercase whitespace-pre-line',
                    picked === zone.value
                      ? 'border-brand bg-brand text-white'
                      : 'border-border-subtle bg-surface text-ink hover:border-brand hover:bg-brand/12'
                  )}
                >
                  {short}
                </button>
              );
            })}
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <Button variant="secondary" onClick={skip}>
          Skip Zone
        </Button>
        <Button onClick={save}>{picked ? `Save · ${zoneLabel}` : 'Save'}</Button>
      </DialogFooter>
    </BaseDialog>
  );
}
