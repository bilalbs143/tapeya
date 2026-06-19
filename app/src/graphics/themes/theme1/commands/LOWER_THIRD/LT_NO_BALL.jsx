import { NoBallBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_NO_BALL({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <NoBallBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
