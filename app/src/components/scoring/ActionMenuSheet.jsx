/**
 * Bottom sheet — Action menu (3-column icon grid).
 */

import actionAdditionalUrl from '@/assets/images/icons/action-additional.svg';
import actionBatUrl from '@/assets/images/icons/action-bat.svg';
import actionBowlUrl from '@/assets/images/icons/action-bowl.svg';
import actionBreakUrl from '@/assets/images/icons/action-break.svg';
import actionDeclareUrl from '@/assets/images/icons/action-declare.svg';
import actionEndInningsUrl from '@/assets/images/icons/action-end-innings.svg';
import actionKeeperUrl from '@/assets/images/icons/action-keeper.svg';
import actionNotesUrl from '@/assets/images/icons/action-notes.svg';
import actionPenaltyUrl from '@/assets/images/icons/action-penalty.svg';
import actionReviseUrl from '@/assets/images/icons/action-revise.svg';
import actionRulesUrl from '@/assets/images/icons/action-rules.svg';
import actionSquadUrl from '@/assets/images/icons/action-squad.svg';
import actionSubstituteUrl from '@/assets/images/icons/action-substitute.svg';
import { SCORING_ACTION_MENU_ITEMS } from '@/lib/constants/scoringActionMenu';
import { BottomSheet } from '@/ui/BottomSheet';
import { CdnIcon } from '@/ui/CdnIcon';

const ICON_CELL =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FFFFFF14] bg-surface text-brand';

const ACTION_ICON_URLS = {
  squad: actionSquadUrl,
  revise: actionReviseUrl,
  bat: actionBatUrl,
  bowl: actionBowlUrl,
  end_innings: actionEndInningsUrl,
  cancel: actionEndInningsUrl,
  break: actionBreakUrl,
  keeper: actionKeeperUrl,
  substitute: actionSubstituteUrl,
  penalty: actionPenaltyUrl,
  additional: actionAdditionalUrl,
  rules: actionRulesUrl,
  notes: actionNotesUrl,
  declare: actionDeclareUrl,
};

function ActionMenuIcon({ name }) {
  const src = ACTION_ICON_URLS[name];
  if (!src) return <span className="h-[18px] w-[18px]" />;
  return <CdnIcon src={src} className="h-[18px] w-[18px]" />;
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(id: string) => void} props.onSelect
 * @param {Set<string>|string[]} [props.disabledIds] Action ids that cannot be used
 */
export function ActionMenuSheet({ open, onClose, onSelect, disabledIds = [] }) {
  const disabled = disabledIds instanceof Set ? disabledIds : new Set(disabledIds);

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="Action"
      ariaLabel="Action Menu"
    >
      <ul className="grid grid-cols-3 gap-x-2 gap-y-5">
        {SCORING_ACTION_MENU_ITEMS.map((item) => {
          const isDisabled = disabled.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onSelect(item.id)}
                className="focus-visible:ring-brand flex w-full flex-col items-center gap-2 rounded-lg px-1 py-2 text-center transition-colors focus:outline-none focus-visible:ring-2 enabled:active:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className={ICON_CELL}>
                  <ActionMenuIcon name={item.icon} />
                </span>
                <span className="text-[10px] leading-tight font-semibold text-white">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
