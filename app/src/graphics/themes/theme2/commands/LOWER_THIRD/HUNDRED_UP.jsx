import { HundredUpBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function HUNDRED_UP({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <HundredUpBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
