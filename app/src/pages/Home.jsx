import { usePlatform } from '@/hooks/usePlatform';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { HeroSlider } from '@/components/HeroSlider';
import { ExploreCategories } from '@/components/ExploreCategories';
import { LiveMatchSlider } from '@/components/LiveMatchSlider';

export default function Home() {
  const platform = usePlatform();

  return (
    <Container>
      <div className="space-y-6">
        <HeroSlider />
        <ExploreCategories />
        <LiveMatchSlider />
      </div>
    </Container>
  );
}
