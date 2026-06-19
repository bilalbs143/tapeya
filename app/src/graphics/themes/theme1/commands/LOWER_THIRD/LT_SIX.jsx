import { SixBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_SIX({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <SixBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
