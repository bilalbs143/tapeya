import { toWormChartData } from '../../adapters/chart.adapter';
import { WormChartGraphic } from '../../layouts/charts/WormChartGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function WORM({ tokens, ...props }) {
  const data = toWormChartData(props, tokens);
  if (!data) return null;

  return (
    <BroadcastShell stage="full">
      <WormChartGraphic data={data} />
    </BroadcastShell>
  );
}
