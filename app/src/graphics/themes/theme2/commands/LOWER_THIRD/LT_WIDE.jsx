import { WideBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LT_WIDE({ isOverlay }) {
  return (
    <BroadcastShell stage="bar">
      <WideBar edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
