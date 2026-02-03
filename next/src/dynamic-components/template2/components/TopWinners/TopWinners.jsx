'use client';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template2/components/LazyImage/LazyImage';
import { formatAmountInMillions } from '@/helpers/formatting';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchRealtimeWinners } from '@/website/websiteAction';

const GameCard = ({ game, showDivider = false }) => {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  return (
    <div className="relative w-80 flex-shrink-0">
      <div className="flex overflow-hidden bg-[#000304] transition-colors duration-200">
        <div className="relative h-20 w-28 overflow-hidden">
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

        <div className="flex flex-1 flex-col justify-between bg-[#000304] p-2">
          <div className="mb-1 flex justify-start">
            <div
              className="flex min-w-fit items-center gap-1 px-3 py-1 text-[10px] text-white"
              style={{
                background: 'linear-gradient(90deg, #7b4ab8 0%, #a51e3e 100%)',
                clipPath: 'polygon(6% 0, 100% 0, 94% 100%, 0 100%)',
              }}
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/gp-icon.svg"
                alt={t('money')}
                width={18}
                height={18}
                className="object-contain"
              />
              <span>
                {formatAmountInMillions(game.winningAmount)} {getCurrency()}
              </span>
            </div>
          </div>

          <h3 className="mb-1 truncate text-[10px] font-medium text-white">
            {game.name}
          </h3>

          <span className="text-[10px] text-white">{game.maskedUsername}</span>
        </div>
      </div>

      {showDivider && (
        <div className="absolute top-3 bottom-3 -left-[6px] z-10 w-[1px] bg-[#51A2FF]" />
      )}
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

  const renderContent = () => {
    if (!infiniteGames.length) {
      const fakeGames = generateFakeGames();
      const doubledFakeGames = [...fakeGames, ...fakeGames]; // Double for smooth infinite scroll

      return doubledFakeGames.map((game, index) => (
        <GameCard
          key={`fake-${index}`}
          game={game}
          showDivider={index < doubledFakeGames.length - 1}
        />
      ));
    }

    return infiniteGames.map((game, index) => (
      <GameCard
        key={`${game.id}-${index}`}
        game={game}
        showDivider={index < infiniteGames.length - 1}
      />
    ));
  };

  return (
    <div className="w-full pb-8">
      <div className="mx-auto">
        <div className="relative overflow-hidden">
          <div className="h-px w-full bg-[#51A2FF]" />

          <div className="animate-scroll flex">{renderContent()}</div>

          <div className="h-px w-full bg-[#51A2FF]" />
        </div>
      </div>
    </div>
  );
};

export default TopWinners;
