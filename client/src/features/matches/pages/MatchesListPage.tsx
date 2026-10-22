import { MatchesListBody } from '../ui/MatchesListBody';
import { useMatchesList } from '../ui/useMatchesList';

/** Live scoring opens `/matches/:id/score` (toss first when it is not saved). */

export default function MatchesListPage() {
  const flow = useMatchesList();
  return <MatchesListBody flow={flow} />;
}
