import TournamentLeaderboardPanel from './TournamentLeaderboardPanel';

export default function HighestWickets(props) {
  return (
    <TournamentLeaderboardPanel
      {...props}
      metricKind="bowling"
      emptyMessage="No tournament bowling stats yet. Completed bowling figures will appear after match stats are recorded."
      featuredAlt="Top bowler"
    />
  );
}
