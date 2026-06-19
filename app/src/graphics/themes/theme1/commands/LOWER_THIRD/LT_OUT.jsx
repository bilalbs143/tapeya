import { OutBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_OUT({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <OutBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
