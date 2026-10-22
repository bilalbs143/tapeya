import type { WicketSummaryModel } from '../lib/wicketSummary';
import { useWicketSummary } from './useWicketSummary';
import { WicketSummaryBody } from './WicketSummaryBody';

type WicketSummaryScreenProps = {
  open: boolean;
  model: WicketSummaryModel | null;
  undoing?: boolean | undefined;
  onUndo: () => void;
  onProceed: () => void;
};

/** Non-dismissible; Undo or Proceed only. */

export function WicketSummaryScreen({ open, model, undoing = false, onUndo, onProceed }: WicketSummaryScreenProps) {
  const flow = useWicketSummary(model);

  if (!model || !flow.ready) return null;

  return (
    <WicketSummaryBody open={open} model={model} flow={flow} undoing={undoing} onUndo={onUndo} onProceed={onProceed} />
  );
}
