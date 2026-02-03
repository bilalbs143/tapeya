'use client';

import GameSlider from '@/dynamic-components/template19/components/GameSlider/GameSlider';
import { useGameData } from '@/hooks/useGameData';
import { useTranslations } from '@/hooks/useTranslations';

function TopGames() {
  const { t } = useTranslations();
  const { games, loading } = useGameData(
    { is_recommended: true },
    { perPage: 20 },
  );

  return (
    <GameSlider
      games={games}
      title={t('top_games')}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-12.png"
      iconAlt={t('game_title_icon')}
      loading={loading}
      perPageDesktop={6}
      perPageMobile={3}
      gap="24"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      showNavigation={true}
      emptyMessage={t('no_top_games')}
      imageClassName="h-[110px] w-full sm:h-[220px] md:h-[226px]"
    />
  );
}

export default TopGames;
