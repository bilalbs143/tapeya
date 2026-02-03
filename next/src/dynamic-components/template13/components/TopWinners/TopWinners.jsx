'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
import { formatAmountInMillions } from '@/helpers/formatting';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchRealtimeWinners } from '@/website/websiteAction';

const GameCard = ({ game, showDivider = false }) => {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  return (
    <div className="relative w-80 flex-shrink-0">
      <div className="flex overflow-hidden bg-transparent transition-colors duration-200">
        <div
          className="relative m-auto h-20 w-28 overflow-hidden rounded-lg border"
          style={{ borderColor: '#20C5FE' }}
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

        <div className="flex flex-1 flex-col justify-between bg-transparent p-2">
          <div className="mb-1 flex justify-start">
            <div
              className="flex min-w-fit items-center gap-2 rounded-[4px] border px-3 py-2 text-[10px] font-semibold text-white"
              style={{ borderColor: '#20C5FE', backgroundColor: '#0C0C0C' }}
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-winner-money-5.svg"
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
        <div className="absolute top-2 bottom-2 -left-[10px] z-10 w-[2px] bg-[#00374a]" />
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
    <motion.div
      className="top-winners-section overflow-hidden px-2 pt-6 md:pt-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      {/* Header - Responsive lines left and right of the title */}
      <motion.div
        className="mb-6 w-full"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.1,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="container mx-auto">
          <div className="flex items-center gap-3 px-0 py-0 md:px-2 md:py-1">
            {/* Left line */}
            <div className="hidden h-[2px] flex-1 bg-[#5AB25A] md:block" />

            {/* Title */}
            <div className="flex items-center gap-3 rounded-none bg-transparent px-0 py-0">
              <h2
                className="text-center text-[16px] font-semibold tracking-wide text-white uppercase md:text-[24px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                Live Winners
              </h2>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="container mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.2,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="relative overflow-hidden">
          <div className="h-[2px] w-full bg-[#00374a]" />

          <div className="animate-scroll flex">{renderContent()}</div>

          <div className="h-[2px] w-full bg-[#00374a]" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TopWinners;
