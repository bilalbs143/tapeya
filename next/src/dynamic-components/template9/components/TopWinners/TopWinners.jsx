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
      className="relative w-48 flex-shrink-0 rounded-[3px] border sm:w-64 md:w-70"
      style={{
        borderColor: 'rgba(219, 180, 44, 0.30)',
        borderWidth: '0.5px',
        backgroundColor: '#12001F',
      }}
    >
      <div className="flex items-start overflow-hidden bg-transparent transition-colors duration-200">
        <div
          className="relative m-auto mt-1.5 mb-1.5 ml-1.5 h-14 w-20 overflow-hidden rounded-[3px] border sm:mt-2 sm:mb-2 sm:ml-2 sm:h-20 sm:w-30"
          style={{
            borderColor: 'rgba(219, 180, 44, 0.30)',
            borderWidth: '1px',
          }}
        >
          <LazyImage
            src={game.image}
            alt={game.name}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://d3emlo5tm9es2f.cloudfront.net/next/images/products/game-btn-img.png';
            }}
          />
        </div>

        <div className="flex flex-1 flex-col justify-between bg-transparent p-1.5 sm:p-2">
          <div className="mb-1.5 flex justify-start sm:mb-2">
            <div
              className="flex min-w-fit items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-[12px] font-semibold text-white sm:gap-2 sm:px-3 sm:py-2 sm:text-[16px]"
              style={{ backgroundColor: '#1C0030' }}
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-winner-money-9.svg"
                alt={t('money')}
                width={14}
                height={14}
                className="object-contain sm:h-[18px] sm:w-[18px]"
              />
              <span>
                {formatAmountInMillions(game.winningAmount)} {getCurrency()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[8px] text-white sm:gap-2 sm:text-[10px]">
            <h3 className="truncate font-medium">{game.name}</h3>
            <span className="ml-1 sm:ml-2">{game.maskedUsername}</span>
          </div>
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
          'https://d3emlo5tm9es2f.cloudfront.net/next/products/game-btn-img.png',
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
          'https://d3emlo5tm9es2f.cloudfront.net/next/products/game-btn-img.png',
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
            className="text-[16px] font-bold tracking-wide whitespace-nowrap text-[#DBB42C] uppercase md:text-[20px]"
            style={{ fontFamily: 'var(--font-alatsi)' }}
          >
            {t('live')}
          </h2>
          <h2
            className="text-[16px] font-bold tracking-wide whitespace-nowrap text-[#DBB42C] uppercase md:text-[20px]"
            style={{ fontFamily: 'var(--font-alatsi)' }}
          >
            {t('winners')}
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
    <div className="top-winners-section relative z-10 w-full pt-4 md:pt-6">
      <div className="">
        <div
          className="relative h-auto overflow-hidden rounded-[3px] border"
          style={{
            borderColor: 'rgba(157, 78, 221, 0.50)',
            backgroundColor: '#1D0032',
          }}
        >
          <div className="flex items-center py-1 md:py-4">
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
