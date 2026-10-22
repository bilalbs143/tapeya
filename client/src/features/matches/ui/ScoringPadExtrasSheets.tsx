import type { UiBall } from '../lib/storeBallPayload';
import { ExtraRunsSheet } from './ExtraRunsSheet';
import { NoBallSheet } from './NoBallSheet';
import { OverthrowSheet } from './OverthrowSheet';
import { PenaltySheet } from './PenaltySheet';
import type { usePadExtrasFlow } from './usePadExtrasFlow';
import { WideBallSheet } from './WideBallSheet';
import { ZonePickerSheet } from './ZonePickerSheet';

type ExtrasApi = ReturnType<typeof usePadExtrasFlow>;

type ScoringPadExtrasSheetsProps = {
  extras: ExtrasApi;
  submit: (ball: UiBall) => void | Promise<void>;
  strikerName: string | null;
};

/** Wide / no-ball / bye-lb / overthrow / penalty / wagon-wheel sheets for the pad. */
export function ScoringPadExtrasSheets({ extras, submit, strikerName }: ScoringPadExtrasSheetsProps) {
  return (
    <>
      <WideBallSheet open={extras.wideOpen} onOpenChange={extras.setWideOpen} onConfirm={(ball) => void submit(ball)} />

      <NoBallSheet
        open={extras.noBallOpen}
        onOpenChange={extras.setNoBallOpen}
        onConfirm={(ball) => void submit(ball)}
      />

      <ExtraRunsSheet
        open={extras.extraKind != null}
        kind={extras.extraKind}
        onOpenChange={(open) => {
          if (!open) extras.setExtraKind(null);
        }}
        onConfirm={extras.confirmExtraRuns}
      />

      <OverthrowSheet
        open={extras.overthrowOpen}
        onOpenChange={(open) => {
          extras.setOverthrowOpen(open);
          if (!open) extras.setOverthrowDelivery(null);
        }}
        initialDeliveryType={extras.overthrowDelivery}
        onConfirm={(ball) => void submit(ball)}
      />

      <PenaltySheet
        open={extras.penaltyOpen}
        onOpenChange={extras.setPenaltyOpen}
        onConfirm={(ball) => void submit(ball)}
      />

      <ZonePickerSheet pending={extras.zonePending} strikerName={strikerName} onCommit={extras.commitZone} />
    </>
  );
}
