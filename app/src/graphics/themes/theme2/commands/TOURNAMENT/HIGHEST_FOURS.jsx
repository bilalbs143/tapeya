import { toLeaderboardData } from '../../adapters/leaderboard.adapter';
import { LeaderboardGraphic } from '../../layouts/full-screen/LeaderboardGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function HIGHEST_FOURS({ tokens: _tokens, ...props }) {
  const leaderboard = toLeaderboardData(props);
  if (!leaderboard) return null;

  return (
    <BroadcastShell stage="full">
      <LeaderboardGraphic title={leaderboard.title} sub={leaderboard.sub} data={leaderboard.data} />
    </BroadcastShell>
  );
}
