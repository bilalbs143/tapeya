import { useParams } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { EmptyState } from '@/shared/ui/states';

import { RankingStatsBody } from '../ui/RankingStatsBody';
import { useRankingStats } from '../ui/useRankingStats';

/** Full ranking table for one category — refetches `/rankings` (deep-link safe). */

export default function RankingStatsPage() {
  const { statType: rawType } = useParams();
  const flow = useRankingStats(rawType);
  const { valid, goList } = flow;

  if (!valid) {
    return (
      <PageDock header={<ScreenBar title="Stats" subtitle="Full Ranking Table" onBack={goList} />}>
        <EmptyState size="lg" title="Unknown Ranking" description="Pick a category from Top players." />
      </PageDock>
    );
  }

  return <RankingStatsBody flow={flow} />;
}
