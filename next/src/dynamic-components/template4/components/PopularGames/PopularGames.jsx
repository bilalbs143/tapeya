'use client';

import GameSlider from '@/dynamic-components/template4/components/GameSlider/GameSlider';
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
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
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
      imageClassName="h-[220px] w-full sm:h-[250px] md:h-[300px] md:w-[237px]"
    />
  );
}

export default PopularGames;
