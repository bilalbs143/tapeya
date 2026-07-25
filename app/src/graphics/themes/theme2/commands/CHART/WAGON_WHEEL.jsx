import { toWagonWheelData } from '../../adapters/chart.adapter';
import { WagonWheelGraphic } from '../../layouts/charts/WagonWheelGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function WAGON_WHEEL({ tokens, enabled = true, ...props }) {
  if (!enabled) return null;

  const data = toWagonWheelData(props, tokens);
  if (!data) return null;

  return (
    <BroadcastShell stage="full">
      <WagonWheelGraphic data={data} />
    </BroadcastShell>
  );
}
