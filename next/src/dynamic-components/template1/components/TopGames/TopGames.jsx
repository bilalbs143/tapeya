'use client';

import GameSlider from '@/dynamic-components/template1/components/GameSlider/GameSlider';
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
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/top.svg"
      iconAlt={t('mp_icon')}
      loading={loading}
      perPageDesktop={6}
      perPageMobile={3}
      gap="20"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      showNavigation={true}
      emptyMessage={t('no_top_games')}
    />
  );
}

export default TopGames;
