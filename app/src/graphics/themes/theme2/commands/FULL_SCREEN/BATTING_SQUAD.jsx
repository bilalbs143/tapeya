import { toSquadBundle } from '../../adapters/squad.adapter';
import { SquadListGraphic } from '../../layouts/full-screen/SquadListGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BATTING_SQUAD({ tokens, ...props }) {
  const resolved = toSquadBundle(props, tokens, 'batting');
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <SquadListGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
