import { FiftyUpBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function FIFTY_UP({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <FiftyUpBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
