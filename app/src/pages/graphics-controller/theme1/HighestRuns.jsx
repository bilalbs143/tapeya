import TournamentLeaderboardPanel from './TournamentLeaderboardPanel';

export default function HighestRuns(props) {
  return (
    <TournamentLeaderboardPanel
      {...props}
      metricKind="batting"
      emptyMessage="No tournament batting stats yet. Played innings will appear after match stats are recorded."
      featuredAlt="Top batter"
    />
  );
}
