import { toPhaseChartData } from '../../adapters/chart.adapter';
import { ManhattGraphic } from '../../layouts/charts/ManhattGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function MANHATTAN({ tokens, ...props }) {
  const data = toPhaseChartData(props, tokens);
  if (!data) return null;

  return (
    <BroadcastShell stage="full">
      <ManhattGraphic data={data} />
    </BroadcastShell>
  );
}
