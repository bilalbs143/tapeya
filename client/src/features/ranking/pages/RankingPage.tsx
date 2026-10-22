import { RankingPageBody } from '../ui/RankingPageBody';
import { useRankingPage } from '../ui/useRankingPage';

export default function RankingPage() {
  const flow = useRankingPage();
  return <RankingPageBody flow={flow} />;
}
