'use client';

import GameSlider from '@/dynamic-components/template21/components/GameSlider/GameSlider';
import { useGameData } from '@/hooks/useGameData';
import { useTranslations } from '@/hooks/useTranslations';

function PopularGames() {
  const { t } = useTranslations();
  const { games, loading } = useGameData(
    { is_trending: true },
    { perPage: 20 },
  );

  return (
    <GameSlider
      games={games}
      title={t('trending_games')}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/popular-games-3.png"
      iconAlt={t('game_title_icon')}
      loading={loading}
      perPageDesktop={6}
      perPageMobile={3}
      gap="24"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      autoplayDirection="prev"
      showNavigation={true}
      emptyMessage={t('no_trending_games')}
    />
  );
}

export default PopularGames;
