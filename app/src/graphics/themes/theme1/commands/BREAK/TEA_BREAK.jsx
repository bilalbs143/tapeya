import { toBreakBundle } from '../../adapters/break.adapter';
import { VSBreakGraphic } from '../../layouts/full-screen/vsBreak';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function TEA_BREAK({ tokens, ...props }) {
  const resolved = toBreakBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <VSBreakGraphic data={resolved.breakData} teams={resolved.teams} />
    </BroadcastShell>
  );
}
