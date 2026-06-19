import { toCustomCaptionData } from '../../adapters/caption.adapter';
import { CustomCaptionLTBar } from '../../layouts/bars/CustomCaptionLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function CUSTOM({ isOverlay, ...props }) {
  const data = toCustomCaptionData(props);
  if (!data) return null;

  return (
    <BroadcastShell stage="bar">
      <CustomCaptionLTBar {...data} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
