import { useCallback, useState } from 'react';

import type { BallLogEntry } from '../lib/ballLog';
import { routeAdminAction } from '../lib/routeAdminAction';
import type { WicketSummaryModel } from '../lib/wicketSummary';
import type { AdminSheetAction } from './AdminActionSheet';
import type { MatchAdminAction } from './MatchActionMenu';
import type { MatchStateAction } from './MatchStateSheet';

/**
 * Open/close state for lifecycle sheets + ball edit/summary.
 * Admin menu apply takes `onPenalty` because pad extras owns the penalty sheet.
 */
export function useScoringDeskSheetsState() {
  const [summaryModel, setSummaryModel] = useState<WicketSummaryModel | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [editing, setEditing] = useState<{
    inningsId: number;
    entry: BallLogEntry;
    overNo: number;
  } | null>(null);
  const [pickedBallInn, setPickedBallInn] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [stateSheet, setStateSheet] = useState<MatchStateAction | null>(null);
  const [adminSheet, setAdminSheet] = useState<AdminSheetAction | null>(null);
  const [declareResultOpen, setDeclareResultOpen] = useState(false);
  const [endMatchOpen, setEndMatchOpen] = useState(false);
  const [creaseOpen, setCreaseOpen] = useState(false);
  const [declareOpen, setDeclareOpen] = useState(false);

  const onWicketSummary = useCallback((model: WicketSummaryModel) => {
    setSummaryModel(model);
    setSummaryOpen(true);
  }, []);

  const closeSummary = useCallback(() => {
    setSummaryOpen(false);
    setSummaryModel(null);
  }, []);

  const proceedAfterWicket = useCallback(() => {
    setSummaryOpen(false);
    setSummaryModel(null);
    setCreaseOpen(true);
  }, []);

  const handleAdminAction = useCallback((code: MatchAdminAction, onPenalty: () => void) => {
    const route = routeAdminAction(code);
    switch (route.kind) {
      case 'declare_squad':
        setDeclareOpen(true);
        return;
      case 'penalty':
        onPenalty();
        return;
      case 'state_sheet':
        setStateSheet(route.action);
        return;
      case 'declare_result':
        setDeclareResultOpen(true);
        return;
      case 'cancel_match':
        setEndMatchOpen(true);
        return;
      case 'admin_sheet':
        setAdminSheet(route.action);
        return;
      case 'noop':
        return;
    }
  }, []);

  return {
    summaryModel,
    summaryOpen,
    editing,
    setEditing,
    pickedBallInn,
    setPickedBallInn,
    moreOpen,
    setMoreOpen,
    actionMenuOpen,
    setActionMenuOpen,
    stateSheet,
    setStateSheet,
    adminSheet,
    setAdminSheet,
    declareResultOpen,
    setDeclareResultOpen,
    endMatchOpen,
    setEndMatchOpen,
    creaseOpen,
    setCreaseOpen,
    declareOpen,
    setDeclareOpen,
    onWicketSummary,
    closeSummary,
    proceedAfterWicket,
    handleAdminAction,
  };
}
