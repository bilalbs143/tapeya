import { ScreenBar } from '@/shared/layout';

import { matchRoutes } from '../routes';
import { QuickMatchFormBody } from '../ui/QuickMatchFormBody';
import { useQuickMatchForm } from '../ui/useQuickMatchForm';

/** Quick match: free steppers for overs / players; toss only when both sides are a full XI. */
export default function QuickMatchPage() {
  const flow = useQuickMatchForm();

  return (
    <QuickMatchFormBody
      flow={flow}
      header={
        <ScreenBar
          title="Quick Match"
          subtitle="Step 1 of 2 · Setup"
          onBack={() => flow.navigate(matchRoutes.list())}
          action={
            <button type="button" onClick={flow.reset} className="text-brand-text px-1 text-xs font-semibold">
              Reset
            </button>
          }
        />
      }
    />
  );
}
