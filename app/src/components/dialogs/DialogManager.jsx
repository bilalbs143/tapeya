import { DownloadAppDialog } from '@platform-download';

import { useDialog } from '@/context/DialogContext';

import AddBreakDialog from './AddBreakDialog';
import AdditionalRunsDialog from './AdditionalRunsDialog';
import AppUpdateDialog from './AppUpdateDialog';
import BaseDialog from './BaseDialog';
import CaughtOutDialog from './CaughtOutDialog';
import ChangeSquadDialog from './ChangeSquadDialog';
import ChangeWicketKeeperDialog from './ChangeWicketKeeperDialog';
import ConfirmDialog from './ConfirmDialog';
import CustomScoreDialog from './CustomScoreDialog';
import DeclareResultDialog from './DeclareResultDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import DraftingSubmitSquadSuccessDialog from './DraftingSubmitSquadSuccessDialog';
import EditBallDialog from './EditBallDialog';
import EndInningsDialog from './EndInningsDialog';
import EndMatchDialog from './EndMatchDialog';
import ExtraRunsDialog from './ExtraRunsDialog';
import FielderPickerDialog from './FielderPickerDialog';
import InningsEndDialog from './InningsEndDialog';
import InterestCampaignDialog from './InterestCampaignDialog';
import { ManageTeamDialog } from './ManageTeamDialog';
import MankadDialog from './MankadDialog';
import ManOfTheMatchDialog from './ManOfTheMatchDialog';
import MatchNotesDialog from './MatchNotesDialog';
import { MatchRulesDialog } from './MatchRulesDialog';
import MatchSettingsDialog from './MatchSettingsDialog';
import NoBallDialog from './NoBallDialog';
import ObstructTheFieldDialog from './ObstructTheFieldDialog';
import OutReasonDialog from './OutReasonDialog';
import OversDialog from './OversDialog';
import OverthrowDialog from './OverthrowDialog';
import PenaltyRunsDialog from './PenaltyRunsDialog';
import PlayersPerSideDialog from './PlayersPerSideDialog';
import PricingSuccessDialog from './PricingSuccessDialog';
import ProfileStrengthReminderDialog from './ProfileStrengthReminderDialog';
import RetiredHurtDialog from './RetiredHurtDialog';
import RetiredOutDialog from './RetiredOutDialog';
import ReviseTargetDialog from './ReviseTargetDialog';
import RunOutDialog from './RunOutDialog';
import { ScoringBatsmanPickerDialog } from './ScoringBatsmanPickerDialog';
import { ScoringBowlerPickerDialog } from './ScoringBowlerPickerDialog';
import { ScoringTossDialog } from './ScoringTossDialog';
import { ShotAreaDialog } from './ShotAreaDialog';
import SubstitutePlayerDialog from './SubstitutePlayerDialog';
import TeamSelectDialog from './TeamSelectDialog';
import TossDialog from './TossDialog';
import WhoIsOutDismissalDialog from './WhoIsOutDismissalDialog';
import WideBallDialog from './WideBallDialog';

// All dialogs are body-only — DialogManager is the single provider of <BaseDialog>.
const DIALOG_COMPONENTS = {
  // Global app dialogs
  appUpdate: AppUpdateDialog,
  downloadApp: DownloadAppDialog,
  inningsEnd: InningsEndDialog,
  manOfTheMatch: ManOfTheMatchDialog,
  pricingSuccess: PricingSuccessDialog,
  draftingSubmitSquadSuccess: DraftingSubmitSquadSuccessDialog,
  profileStrengthReminder: ProfileStrengthReminderDialog,
  interestCampaign: InterestCampaignDialog,
  deleteAccount: DeleteAccountDialog,
  manageTeam: ManageTeamDialog,
  confirm: ConfirmDialog,
  // Start Match dialogs
  startMatchOvers: OversDialog,
  startMatchPlayersPerSide: PlayersPerSideDialog,
  startMatchTeamSelect: TeamSelectDialog,
  startMatchToss: TossDialog,
  // Scoring dialogs
  scoringExtraRuns: ExtraRunsDialog,
  scoringNoBall: NoBallDialog,
  scoringWideBall: WideBallDialog,
  scoringOverthrow: OverthrowDialog,
  scoringPenaltyRuns: PenaltyRunsDialog,
  scoringRunOut: RunOutDialog,
  scoringCaughtOut: CaughtOutDialog,
  scoringObstructTheField: ObstructTheFieldDialog,
  scoringOutReason: OutReasonDialog,
  scoringFielderPicker: FielderPickerDialog,
  scoringRetiredHurt: RetiredHurtDialog,
  scoringRetiredOut: RetiredOutDialog,
  scoringMankad: MankadDialog,
  scoringWhoIsOutDismissal: WhoIsOutDismissalDialog,
  scoringCustomScore: CustomScoreDialog,
  scoringShotArea: ShotAreaDialog,
  scoringBatsman: ScoringBatsmanPickerDialog,
  scoringBowler: ScoringBowlerPickerDialog,
  scoringToss: ScoringTossDialog,
  scoringAddBreaks: AddBreakDialog,
  scoringAdditionalRuns: AdditionalRunsDialog,
  scoringMatchSettings: MatchSettingsDialog,
  scoringMatchNotes: MatchNotesDialog,
  scoringMatchRules: MatchRulesDialog,
  scoringChangeSquad: ChangeSquadDialog,
  scoringChangeWicketKeeper: ChangeWicketKeeperDialog,
  scoringSubstitutePlayer: SubstitutePlayerDialog,
  scoringEndInnings: EndInningsDialog,
  scoringEditBall: EditBallDialog,
  scoringEndMatch: EndMatchDialog,
  scoringDeclareResult: DeclareResultDialog,
  scoringReviseTarget: ReviseTargetDialog,
};

// Per-dialog contentClassName overrides — height (!h-auto) and max-height (!max-h-[90vh])
// are provided by BaseDialog; only add extras like min-height here.
const DIALOG_CONTENT_CLASS_BY_KEY = {
  manageTeam: '!min-h-[540px] !max-h-[90vh]',
  inningsEnd: '!min-h-[260px]',
  scoringAddBreaks: '!min-h-[480px] !max-h-[90vh]',
  scoringAdditionalRuns: '!min-h-[240px]',
  scoringMatchSettings: '!min-h-[420px] !max-h-[90vh]',
  scoringMatchNotes: '!min-h-[420px] !max-h-[90vh]',
  scoringMatchRules: '!min-h-[360px] !max-h-[90vh]',
  scoringExtraRuns: '!min-h-[280px] !max-h-[90vh]',
  scoringChangeSquad: '!min-h-[240px]',
  scoringCaughtOut: '!min-h-[360px] !max-h-[90vh]',
  scoringEditBall: '!min-h-[280px] !max-h-[90vh]',
  scoringChangeWicketKeeper: '!min-h-[360px] !max-h-[90vh]',
  scoringSubstitutePlayer: '!min-h-[480px] !max-h-[90vh]',
  scoringEndInnings: '!min-h-[320px] !max-h-[90vh]',
  scoringEndMatch: '!min-h-[320px] !max-h-[90vh]',
  scoringDeclareResult: '!min-h-[360px] !max-h-[90vh]',
  scoringReviseTarget: '!min-h-[300px] !max-h-[90vh]',
  scoringNoBall: '!min-h-[420px] !max-h-[90vh]',
  scoringWideBall: '!min-h-[280px] !max-h-[90vh]',
  scoringOverthrow: '!min-h-[300px] !max-h-[90vh]',
  scoringPenaltyRuns: '!min-h-[420px] !max-h-[90vh]',
  scoringRunOut: '!min-h-[480px] !max-h-[90vh]',
  scoringObstructTheField: '!min-h-[420px] !max-h-[90vh]',
  scoringFielderPicker: '!min-h-[360px] !max-h-[90vh]',
  scoringRetiredHurt: '!min-h-[380px] !max-h-[90vh]',
  scoringRetiredOut: '!min-h-[380px] !max-h-[90vh]',
  scoringMankad: '!min-h-[320px] !max-h-[90vh]',
  scoringWhoIsOutDismissal: '!min-h-[360px] !max-h-[90vh]',
  manOfTheMatch: '!min-h-[260px]',
  interestCampaign: '!min-h-[480px] !max-h-[90vh]',
};

export function DialogManager() {
  const { dialogKey, dialogProps, closeDialog } = useDialog();

  const DialogBody = dialogKey ? DIALOG_COMPONENTS[dialogKey] : null;
  if (!DialogBody) return null;

  return (
    <BaseDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          const onDismiss = dialogProps?.onDismiss;
          closeDialog();
          onDismiss?.();
        }
      }}
      contentClassName={DIALOG_CONTENT_CLASS_BY_KEY[dialogKey] ?? ''}
    >
      <DialogBody {...dialogProps} />
    </BaseDialog>
  );
}

export default DialogManager;
