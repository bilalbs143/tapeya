import { ExploreCategories } from '@/components/ExploreCategories';
import { HeroSlider } from '@/components/HeroSlider';
import { HighlightSlider } from '@/components/HighlightSlider';
import { LiveMatchSlider } from '@/components/LiveMatchSlider';
import { usePlatform } from '@/hooks/usePlatform';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

export default function Home() {
  const platform = usePlatform();

  return (
    <Container>
      <div className="space-y-6">
        <HeroSlider />
        <ExploreCategories />
        <LiveMatchSlider />
        <HighlightSlider />
      </div>
    </Container>
  );
}
