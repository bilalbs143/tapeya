import { toMomPlayer } from '../../adapters/player.adapter';
import { MomGraphic } from '../../layouts/full-screen/MomGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function MOM({ tokens, ...props }) {
  const resolved = toMomPlayer(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <MomGraphic player={resolved.player} teams={resolved.teams} sub={resolved.sub} />
    </BroadcastShell>
  );
}
