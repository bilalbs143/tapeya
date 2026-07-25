import { ReplayBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_REPLAY({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <ReplayBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
