import { ExploreCategories } from '@/components/ExploreCategories';
import { HeroSlider } from '@/components/HeroSlider';
import { HighlightSlider } from '@/components/HighlightSlider';
import { LiveMatchSlider } from '@/components/LiveMatchSlider';
import { Container } from '@/ui/Container';

export default function Home() {
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
