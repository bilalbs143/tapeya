'use client';

import React from 'react';

import GameSlider from '@/dynamic-components/template1/components/GameSlider/GameSlider';
import { useGameData } from '@/hooks/useGameData';
import { useTranslations } from '@/hooks/useTranslations';

function NewGames() {
  const { t } = useTranslations();
  const { games, loading } = useGameData({ is_new: true }, { perPage: 20 });

  return (
    <GameSlider
      games={games}
      title={t('new_games')}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/new-game-star.svg"
      iconAlt={t('new_game_star_icon')}
      loading={loading}
      perPageDesktop={6}
      perPageMobile={3}
      gap="20"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      autoplayDirection="prev"
      showNavigation={true}
      emptyMessage={t('no_new_games')}
    />
  );
}

export default NewGames;
