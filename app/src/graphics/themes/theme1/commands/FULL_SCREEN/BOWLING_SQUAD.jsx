import { toSquadBundle } from '../../adapters/squad.adapter';
import { SquadListGraphic } from '../../layouts/full-screen/SquadListGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BOWLING_SQUAD({ tokens, ...props }) {
  const resolved = toSquadBundle(props, tokens, 'bowling');
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <SquadListGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
