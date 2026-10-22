import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
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
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Stats" subtitle="Full Ranking Table" onBack={goList} />
        <div className="px-4 py-8">
          <EmptyState title="Unknown Ranking" description="Pick a category from Top players." />
        </div>
      </div>
    );
  }

  return <RankingStatsBody flow={flow} />;
}
