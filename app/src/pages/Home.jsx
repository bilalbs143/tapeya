import { useMemo } from 'react';

import { ExploreCategories } from '@/components/ExploreCategories';
import FeedRegion from '@/components/feed/FeedRegion';
import { HeroSlider } from '@/components/HeroSlider';
import { LiveMatchSlider } from '@/components/LiveMatchSlider';
import { HomeLiveScoreSlider } from '@/components/scorecard/HomeLiveScoreSlider';
import { normaliseLiveStreams } from '@/lib/utils/liveStreamUtils';
import { useGetLiveStreamsQuery } from '@/store/api/liveApi';
import { Container } from '@/ui/Container';

export default function Home() {
  const { data: liveStreamsRaw } = useGetLiveStreamsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const liveStreams = useMemo(() => normaliseLiveStreams(liveStreamsRaw), [liveStreamsRaw]);

  return (
    <Container>
      <FeedRegion
        top={
          <div className="mb-[15px] space-y-[15px]">
            <HeroSlider />
            <ExploreCategories />
            <HomeLiveScoreSlider />
            <LiveMatchSlider streams={liveStreams} />
          </div>
        }
      />
    </Container>
  );
}
