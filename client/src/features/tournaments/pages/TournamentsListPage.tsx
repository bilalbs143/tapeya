import { TournamentsListBody } from '../ui/TournamentsListBody';
import { useTournamentsList } from '../ui/useTournamentsList';

/** My tournaments hub — Type C: ScreenBar + Active · Previous sections. Create goes straight to POST /tournaments (no review/request queue). */

export default function TournamentsListPage() {
  const flow = useTournamentsList();
  return <TournamentsListBody flow={flow} />;
}
