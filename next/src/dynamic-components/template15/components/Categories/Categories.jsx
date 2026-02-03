'use client';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template9/components/LazyImage/LazyImage';
import { formatAmountInMillions } from '@/helpers/formatting';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchRealtimeWinners } from '@/website/websiteAction';

const GameCard = ({ game, showDivider = false }) => {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  return (
    <div
      className="relative flex h-[73px] w-[209px] flex-shrink-0 items-center gap-3 rounded-[12px] bg-[#151517] px-3 py-2"
      style={{
        border: '1px solid #CBBC9121',
      }}
    >
      {/* Game Image */}
      <div className="relative h-[50px] w-[50px] flex-shrink-0 overflow-hidden rounded-[8px]">
        <LazyImage
          src={game.image}
          alt={game.name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'https://d3emlo5tm9es2f.cloudfront.net/next/products/game-btn-img-12.png';
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        {/* Username */}
        <h3 className="text-[14px] leading-tight font-bold text-white">
          {game.maskedUsername}
        </h3>

        {/* Amount Pill */}
        <div
          className="flex w-fit items-center gap-1.5 rounded-[6px] px-5 py-1"
          style={{ backgroundColor: '#0F5045' }}
        >
          <LazyImage
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/ph_coins-light.png"
            alt={t('money')}
            width={12}
            height={12}
            className="object-contain"
          />
          <span className="text-[12px] font-bold text-white">
            {formatAmountInMillions(game.winningAmount)} {getCurrency()}
          </span>
        </div>
      </div>
    </div>
  );
};

const TopWinners = () => {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { realtimeWinnersData } = useSelector((state) => state.website);

  useEffect(() => {
    dispatch(fetchRealtimeWinners());
  }, [dispatch]);

  const generateFakeAmount = () => {
    // Generate a random 4-digit amount between 1000 and 9999
    return Math.floor(Math.random() * 9000) + 1000;
  };

  const generateFakeUsername = () => {
    // Always generate a new fake username
    const adjectives = [
      t('fake_username_lucky'),
      t('fake_username_happy'),
      t('fake_username_golden'),
      t('fake_username_super'),
      t('fake_username_mega'),
      t('fake_username_epic'),
      t('fake_username_pro'),
      t('fake_username_star'),
    ];
    const nouns = [
      t('fake_username_player'),
      t('fake_username_winner'),
      t('fake_username_gamer'),
      t('fake_username_champ'),
      t('fake_username_master'),
      t('fake_username_hero'),
      t('fake_username_king'),
      t('fake_username_legend'),
    ];

    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 90) + 10;

    return `${randomAdj}${randomNum}${randomNoun}`;
  };

  const maskUsername = (username) => {
    if (!username || username.length <= 3) return username;
    const visiblePart = username.slice(0, -3);
    return `${visiblePart}★★★`;
  };

  const infiniteGames = useMemo(() => {
    if (!realtimeWinnersData?.length) return [];

    const games = realtimeWinnersData.map((winner) => {
      const winAmount = winner.win;
      const isZeroWin =
        !winAmount || winAmount === '0' || parseInt(winAmount) === 0;

      const winningAmount = isZeroWin
        ? generateFakeAmount().toString()
        : winAmount.toString();

      const username = winner.user?.username || t('unknown_user');
      let finalUsername;

      if (isZeroWin) {
        const fakeUsername = generateFakeUsername();
        finalUsername = maskUsername(fakeUsername);
      } else {
        finalUsername = maskUsername(username);
      }

      return {
        id: winner.id,
        name: winner.game?.name || t('unknown_game'),
        winningAmount: winningAmount,
        image:
          winner.game?.image_url ||
          'https://d3emlo5tm9es2f.cloudfront.net/next/products/game-btn-img-12.png',
        maskedUsername: finalUsername,
      };
    });

    return [...games, ...games];
  }, [realtimeWinnersData, t]);

  const generateFakeGames = () => {
    const fakeGames = [];
    const gameNames = [
      'Gates of Olympus',
      'Sweet Bonanza',
      'Starlight Princess',
      'Sugar Rush',
      'Wild West Gold',
      'Fire Strike',
      'Big Bass Bonanza',
      'Fruit Party',
      'Aztec Gems',
      'Book of Dead',
      'Mega Moolah',
      'Starburst',
      "Gonzo's Quest",
      'Dead or Alive',
      'Immortal Romance',
      'Thunderstruck II',
      'Fortune Panda',
      'Golden Tiger',
      'Lucky Dragon',
      'Mystic Fortune',
    ];

    for (let i = 0; i < 20; i++) {
      const fakeUsername = generateFakeUsername();
      fakeGames.push({
        id: `fake-${i}`,
        name: gameNames[i % gameNames.length],
        winningAmount: generateFakeAmount().toString(),
        image:
          'https://d3emlo5tm9es2f.cloudfront.net/next/products/game-btn-img-12.png',
        maskedUsername: maskUsername(fakeUsername),
      });
    }

    return fakeGames;
  };

  const LiveWinnersTitle = () => {
    const { t } = useTranslations();
    return (
      <div className="flex flex-shrink-0 items-center justify-center px-4 md:px-6">
        <div className="flex flex-col items-start">
          <h2
            className="text-[16px] font-bold tracking-wide whitespace-nowrap text-[#CBBC91] uppercase md:text-[16px]"
            style={{ fontFamily: 'var(--font-alatsi)' }}
          >
            {t('live_winners')}
          </h2>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!infiniteGames.length) {
      const fakeGames = generateFakeGames();
      const doubledFakeGames = [...fakeGames, ...fakeGames]; // Double for smooth infinite scroll

      return [
        ...doubledFakeGames.map((game, index) => (
          <GameCard
            key={`fake-${index}`}
            game={game}
            showDivider={index < doubledFakeGames.length - 1}
          />
        )),
        // Duplicate for seamless loop
        ...doubledFakeGames.map((game, index) => (
          <GameCard
            key={`fake-dup-${index}`}
            game={game}
            showDivider={index < doubledFakeGames.length - 1}
          />
        )),
      ];
    }

    return [
      ...infiniteGames.map((game, index) => (
        <GameCard
          key={`${game.id}-${index}`}
          game={game}
          showDivider={index < infiniteGames.length - 1}
        />
      )),
      // Duplicate for seamless loop
      ...infiniteGames.map((game, index) => (
        <GameCard
          key={`${game.id}-dup-${index}`}
          game={game}
          showDivider={index < infiniteGames.length - 1}
        />
      )),
    ];
  };

  return (
    <div className="top-winners-section relative z-10 hidden w-full pt-4 md:block md:pt-6">
      <div className="md:mx-auto md:max-w-[1530px]">
        <div
          className="relative h-auto overflow-hidden rounded-[15px] border"
          style={{
            borderColor: '#CBBC9121',
            backgroundColor: '#222126',
          }}
        >
          <div className="flex items-center py-1 md:py-3">
            {/* Fixed Title */}
            <LiveWinnersTitle />

            {/* Scrolling Content */}
            <div className="flex-1 overflow-hidden">
              <div className="animate-scroll flex items-center gap-3">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopWinners;
