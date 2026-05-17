import { useDialog } from '@/context/DialogContext';

import AppUpdateDialog from './AppUpdateDialog';
import BaseDialog from './BaseDialog';
import CustomScoreDialog from './CustomScoreDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import DraftingSubmitSquadSuccessDialog from './DraftingSubmitSquadSuccessDialog';
import ExtraRunsDialog from './ExtraRunsDialog';
import FielderPickerDialog from './FielderPickerDialog';
import InningsEndDialog from './InningsEndDialog';
import ManOfTheMatchDialog from './ManOfTheMatchDialog';
import OutReasonDialog from './OutReasonDialog';
import OversDialog from './OversDialog';
import PlayersPerSideDialog from './PlayersPerSideDialog';
import PricingSuccessDialog from './PricingSuccessDialog';
import ProfileStrengthReminderDialog from './ProfileStrengthReminderDialog';
import { RetiredHurtConfirmDialog } from './RetiredHurtConfirmDialog';
import { ScoringBatsmanPickerDialog } from './ScoringBatsmanPickerDialog';
import { ScoringBowlerPickerDialog } from './ScoringBowlerPickerDialog';
import { ScoringTossDialog } from './ScoringTossDialog';
import { ShotAreaDialog } from './ShotAreaDialog';
import TeamSelectDialog from './TeamSelectDialog';
import TossDialog from './TossDialog';
import TournamentSquadUpdatedSuccessDialog from './TournamentSquadUpdatedSuccessDialog';

// All dialogs are body-only — DialogManager is the single provider of <BaseDialog>.
const DIALOG_COMPONENTS = {
  // Global app dialogs
  appUpdate: AppUpdateDialog,
  inningsEnd: InningsEndDialog,
  manOfTheMatch: ManOfTheMatchDialog,
  pricingSuccess: PricingSuccessDialog,
  draftingSubmitSquadSuccess: DraftingSubmitSquadSuccessDialog,
  tournamentSquadUpdatedSuccess: TournamentSquadUpdatedSuccessDialog,
  profileStrengthReminder: ProfileStrengthReminderDialog,
  deleteAccount: DeleteAccountDialog,
  // Start Match dialogs
  startMatchOvers: OversDialog,
  startMatchPlayersPerSide: PlayersPerSideDialog,
  startMatchTeamSelect: TeamSelectDialog,
  startMatchToss: TossDialog,
  // Scoring dialogs
  scoringExtraRuns: ExtraRunsDialog,
  scoringOutReason: OutReasonDialog,
  scoringFielderPicker: FielderPickerDialog,
  scoringRetiredHurt: RetiredHurtConfirmDialog,
  scoringCustomScore: CustomScoreDialog,
  scoringShotArea: ShotAreaDialog,
  scoringBatsman: ScoringBatsmanPickerDialog,
  scoringBowler: ScoringBowlerPickerDialog,
  scoringToss: ScoringTossDialog,
};

// Per-dialog contentClassName overrides — height (!h-auto) and max-height (!max-h-[90vh])
// are provided by BaseDialog; only add extras like min-height here.
const DIALOG_CONTENT_CLASS_BY_KEY = {
  inningsEnd: '!min-h-[260px]',
  manOfTheMatch: '!min-h-[260px]',
};

export function DialogManager() {
  const { dialogKey, dialogProps, closeDialog } = useDialog();

  const DialogBody = dialogKey ? DIALOG_COMPONENTS[dialogKey] : null;
  if (!DialogBody) return null;

  return (
    <BaseDialog
      open
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
      contentClassName={DIALOG_CONTENT_CLASS_BY_KEY[dialogKey] ?? ''}
    >
      <DialogBody {...dialogProps} />
    </BaseDialog>
  );
}

export default DialogManager;
