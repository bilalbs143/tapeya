import { FourBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_FOUR({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <FourBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
