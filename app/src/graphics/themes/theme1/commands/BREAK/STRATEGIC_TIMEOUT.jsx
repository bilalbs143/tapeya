import { toStrategicTimeoutBundle } from '../../adapters/strategicTimeout.adapter';
import { StrategicTimeoutGraphic } from '../../layouts/full-screen/StrategicTimeoutGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function STRATEGIC_TIMEOUT({ tokens, ...props }) {
  const bundle = toStrategicTimeoutBundle(props, tokens);
  if (!bundle) return null;

  return (
    <BroadcastShell stage="full">
      <StrategicTimeoutGraphic data={bundle.data} teams={bundle.teams} />
    </BroadcastShell>
  );
}
