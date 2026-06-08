import { useRetiredOutFlow } from '@/hooks/useRetiredOutFlow';
import { retiredOutSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';

import { RetiredDismissalDialog } from './RetiredDismissalDialog';

/**
 * Retired out — counts as a wicket; batter does not return.
 */
export function RetiredOutDialog({ batsmen, strikerId, nonStrikerId, bowlerId, onConfirm, onBack }) {
  return (
    <RetiredDismissalDialog
      countAsWicket={true}
      batsmen={batsmen}
      useFlow={useRetiredOutFlow}
      selectionToUiFields={retiredOutSelectionToUiFields}
      strikerId={strikerId}
      nonStrikerId={nonStrikerId}
      bowlerId={bowlerId}
      onConfirm={onConfirm}
      onBack={onBack}
    />
  );
}

export default RetiredOutDialog;
