import { DecisionPendingBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function DECISION_PENDING({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <DecisionPendingBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
