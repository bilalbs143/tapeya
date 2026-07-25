import { NotOutBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_NOT_OUT({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <NotOutBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
