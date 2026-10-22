import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';

import { adminRulesRows, adminRulesSubtitle } from '../lib/adminActionSheetMeta';
import type { AdminPlayer, AdminSheetAction } from '../lib/adminActionSheetTypes';
import { AdminActionSheetBody } from './AdminActionSheetBody';
import { useAdminActionSheet } from './useAdminActionSheet';

export type { AdminPlayer, AdminSheetAction } from '../lib/adminActionSheetTypes';

type AdminActionSheetProps = {
  action: AdminSheetAction | null;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  inningsId: number | null;
  bowlingTeamId: number | null;
  battingShort: string;
  fieldingPlayers: AdminPlayer[];
  currentBowlerId: number | null;
  batsmenOnCrease: AdminPlayer[];
  eligibleSubstitutes: AdminPlayer[];
  oversPerSide: number | null;
  playersPerSide: number | null;
  tournamentShort?: string | null | undefined;
};

/** Keeper, substitute, additional runs, breaks, notes, rules follow-ups. */
export function AdminActionSheet({
  action,
  onOpenChange,
  matchId,
  inningsId,
  bowlingTeamId,
  battingShort,
  fieldingPlayers,
  currentBowlerId,
  batsmenOnCrease,
  eligibleSubstitutes,
  oversPerSide,
  playersPerSide,
  tournamentShort = null,
}: AdminActionSheetProps) {
  const model = useAdminActionSheet({
    action,
    onOpenChange,
    matchId,
    inningsId,
    bowlingTeamId,
    batsmenOnCrease,
  });

  const { open, meta, saving, primaryDisabled, primaryLabel, commit } = model;

  if (!open || !action || !meta) return null;

  const rulesSubtitle = adminRulesSubtitle(tournamentShort);
  const rulesRows = adminRulesRows(oversPerSide, playersPerSide);

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} sheet contentClassName="tab:max-w-dialog">
      <DialogHeader>
        <DialogTitle>{meta[0]}</DialogTitle>
        {action === 'substitute' ? (
          <DialogDescription>
            {battingShort} batting · replace a batter on the crease with someone from the XI.
          </DialogDescription>
        ) : action === 'match_rules' ? (
          <DialogDescription>{rulesSubtitle}</DialogDescription>
        ) : meta[1] ? (
          <DialogDescription>{meta[1]}</DialogDescription>
        ) : (
          <DialogDescription className="sr-only">{meta[0]}</DialogDescription>
        )}
      </DialogHeader>

      <Form
        id="admin-action-form"
        density="compact"
        onSubmit={(e) => {
          e.preventDefault();
          if (action === 'match_rules' || primaryDisabled) return;
          void commit();
        }}
      >
        <DialogBody>
          <AdminActionSheetBody
            action={action}
            fieldingPlayers={fieldingPlayers}
            currentBowlerId={currentBowlerId}
            batsmenOnCrease={batsmenOnCrease}
            eligibleSubstitutes={eligibleSubstitutes}
            rulesRows={rulesRows}
            model={model}
          />
        </DialogBody>
      </Form>

      <DialogFooter>
        {action === 'match_rules' ? (
          <Button size="md" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        ) : (
          <Button type="submit" form="admin-action-form" size="md" disabled={primaryDisabled}>
            {saving ? 'Saving…' : primaryLabel}
          </Button>
        )}
      </DialogFooter>
    </BaseDialog>
  );
}
