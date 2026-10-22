import { UpcomingTournamentsBody } from '../ui/UpcomingTournamentsBody';
import { useUpcomingTournaments } from '../ui/useUpcomingTournaments';

/** GET /tournaments?all=1, filtered by end_date. */

export default function UpcomingTournamentsPage() {
  const flow = useUpcomingTournaments();
  return <UpcomingTournamentsBody flow={flow} />;
}
