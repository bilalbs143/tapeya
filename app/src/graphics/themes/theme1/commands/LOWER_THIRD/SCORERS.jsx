import { toOfficialsData } from '../../adapters/officials.adapter';
import { OfficialsLTBar } from '../../layouts/bars/OfficialsLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function SCORERS({ isOverlay, tokens: _tokens, ...props }) {
  const officials = toOfficialsData(props);
  if (!officials) return null;

  return (
    <BroadcastShell stage="bar">
      <OfficialsLTBar
        data={officials}
        edgeToEdge={isOverlay}
        heading={officials.heading || 'SCORERS'}
        subtitle={officials.subtitle ?? 'MATCH'}
      />
    </BroadcastShell>
  );
}
