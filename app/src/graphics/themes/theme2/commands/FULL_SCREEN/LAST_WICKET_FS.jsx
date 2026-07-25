import { toLastWicketFsBatter } from '../../adapters/fallOfWickets.adapter';
import { LastWicketFSGraphic } from '../../layouts/full-screen/LastWicketFSGraphic';
import { FSStage } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LAST_WICKET_FS({ tokens, ...props }) {
  const resolved = toLastWicketFsBatter(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <FSStage>
        <LastWicketFSGraphic batter={resolved.batter} teams={resolved.teams} sub={resolved.sub} />
      </FSStage>
    </BroadcastShell>
  );
}
