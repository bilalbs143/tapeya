import { useCallback, useState } from 'react';

import { toast } from '@/shared/ui/toast';

import { noBallSelectionToUiFields } from '../lib/noBallExtras';
import { OVERTHROW_PRESET_NO_BALL, OVERTHROW_PRESET_WIDE } from '../lib/overthrowExtras';
import type { UiBall } from '../lib/storeBallPayload';
import { wideBallSelectionToUiFields } from '../lib/wideBallExtras';
import type { OverflowAction } from './OverflowSheet';
import type { ExtraCode } from './ScoringPad';
import type { ZonePending } from './ZonePickerSheet';

type EnumOption = { value: string };

/**
 * Pad extras / overflow / wagon-wheel sheet state.
 * Submit stays external (useStoreBallSubmit); wicket opens via `openWicket`.
 */
export function usePadExtrasFlow(args: {
  submit: (ball: UiBall) => void | Promise<void>;
  openWicket: (fromExtra?: 'wd' | 'nb' | null) => void;
  wagonWheelEnabled: boolean;
  strikerId: number | null | undefined;
  noBallTypes: EnumOption[];
  noBallRunsTypes: EnumOption[];
}) {
  const { submit, openWicket, wagonWheelEnabled, strikerId, noBallTypes, noBallRunsTypes } = args;

  const [wideOpen, setWideOpen] = useState(false);
  const [noBallOpen, setNoBallOpen] = useState(false);
  const [extraKind, setExtraKind] = useState<Extract<ExtraCode, 'bye' | 'lb'> | null>(null);
  const [overthrowOpen, setOverthrowOpen] = useState(false);
  const [overthrowDelivery, setOverthrowDelivery] = useState<string | null>(null);
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [zonePending, setZonePending] = useState<ZonePending | null>(null);

  const onRuns = useCallback(
    (runs: number) => {
      if (wagonWheelEnabled && runs > 0) setZonePending({ runs });
      else void submit({ type: 'runs', runs });
    },
    [submit, wagonWheelEnabled]
  );

  const onExtra = useCallback(
    (code: ExtraCode) => {
      if (code === 'wd') {
        void submit(wideBallSelectionToUiFields(0));
        return;
      }
      if (code === 'nb') {
        const noBallType = noBallTypes[0]?.value;
        const noBallRunsType = noBallRunsTypes[0]?.value;
        if (!noBallType || !noBallRunsType) {
          setNoBallOpen(true);
          return;
        }
        void submit(
          noBallSelectionToUiFields({
            extraRuns: 0,
            noBallType,
            noBallRunsType,
          })
        );
        return;
      }
      if (code === 'bye' || code === 'lb') {
        void submit({ type: code, runs: 1 });
        return;
      }
      setExtraKind(code);
    },
    [noBallRunsTypes, noBallTypes, submit]
  );

  const onOverflowAction = useCallback(
    (action: OverflowAction) => {
      if (action === 'overthrow_wide') {
        setOverthrowDelivery(OVERTHROW_PRESET_WIDE);
        setOverthrowOpen(true);
        return;
      }
      if (action === 'overthrow_nb') {
        setOverthrowDelivery(OVERTHROW_PRESET_NO_BALL);
        setOverthrowOpen(true);
        return;
      }
      if (action === 'wicket_wide') {
        openWicket('wd');
        return;
      }
      if (action === 'wicket_nb') {
        openWicket('nb');
        return;
      }
      if (action === 'penalty') {
        setPenaltyOpen(true);
        return;
      }
      if (action === 'retire') {
        if (strikerId == null) {
          toast({ title: 'Set the crease before retiring a batter.', tone: 'error' });
          return;
        }
        void submit({
          type: 'retired_hurt',
          dismissalType: 'retired_hurt',
          outPlayerId: strikerId,
        });
      }
    },
    [openWicket, strikerId, submit]
  );

  const commitZone = useCallback(
    (result: ZonePending & { zone?: string | undefined }) => {
      setZonePending(null);
      void submit({
        type: 'runs',
        runs: result.runs,
        ...(result.zone ? { shotDirection: result.zone } : {}),
      });
    },
    [submit]
  );

  const confirmExtraRuns = useCallback(
    (kind: Extract<ExtraCode, 'bye' | 'lb'>, runs: number) => {
      setExtraKind(null);
      void submit({ type: kind, runs });
    },
    [submit]
  );

  return {
    wideOpen,
    setWideOpen,
    noBallOpen,
    setNoBallOpen,
    extraKind,
    setExtraKind,
    overthrowOpen,
    setOverthrowOpen,
    overthrowDelivery,
    setOverthrowDelivery,
    penaltyOpen,
    setPenaltyOpen,
    zonePending,
    onRuns,
    onExtra,
    onOverflowAction,
    commitZone,
    confirmExtraRuns,
  };
}
