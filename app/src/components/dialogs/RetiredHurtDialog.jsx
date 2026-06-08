import { useRetiredHurtFlow } from '@/hooks/useRetiredHurtFlow';
import { retiredHurtSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';

import { RetiredDismissalDialog } from './RetiredDismissalDialog';

/**
 * Retired hurt — who leaves the crease (not a wicket), don't count ball, delivery type.
 */
export function RetiredHurtDialog({ batsmen, strikerId, nonStrikerId, bowlerId, onConfirm }) {
  return (
    <RetiredDismissalDialog
      countAsWicket={false}
      batsmen={batsmen}
      useFlow={useRetiredHurtFlow}
      selectionToUiFields={retiredHurtSelectionToUiFields}
      strikerId={strikerId}
      nonStrikerId={nonStrikerId}
      bowlerId={bowlerId}
      onConfirm={onConfirm}
    />
  );
}

export default RetiredHurtDialog;
