'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
import { formatAmountInMillions } from '@/helpers/formatting';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';
import {
  fetchAllProvider,
  fetchRealtimeWinners,
} from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

const RightSidebar = memo(function RightSidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();
  const { handlePlayGame } = useGameLaunch();
  const { realtimeWinnersData, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = (e) => setIsMobile(e.matches);
    // Set initial state
    setIsMobile(mq.matches);
    // Subscribe to changes
    try {
      mq.addEventListener('change', updateIsMobile);
      return () => mq.removeEventListener('change', updateIsMobile);
    } catch (_) {
      // Fallback for older browsers
      mq.addListener(updateIsMobile);
      return () => mq.removeListener(updateIsMobile);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchRealtimeWinners());
    dispatch(fetchAllProvider());
  }, [dispatch]);

  const generateFakeAmount = () => {
    return Math.floor(Math.random() * 9000) + 1000;
  };

  const generateFakeUsername = () => {
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

  const liveWinners = useMemo(() => {
    if (!realtimeWinnersData?.length) {
      // Return empty array if no data, will show placeholder
      return [];
    }

    const winners = realtimeWinnersData.map((winner) => {
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
        gameName: winner.game?.name || t('unknown_game'),
        winningAmount: winningAmount,
        image:
          winner.game?.image_url ||
          'https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-winner-5.png',
        maskedUsername: finalUsername,
      };
    });

    return winners;
  }, [realtimeWinnersData, t]);

  // Generate fake games data if no real data
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

    for (let i = 0; i < 30; i++) {
      const fakeUsername = generateFakeUsername();
      fakeGames.push({
        id: `fake-${i}`,
        gameName: gameNames[i % gameNames.length],
        winningAmount: generateFakeAmount().toString(),
        image:
          'https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-winner-5.png',
        maskedUsername: maskUsername(fakeUsername),
      });
    }

    return fakeGames;
  };

  const displayWinners =
    liveWinners.length > 0 ? liveWinners : generateFakeGames();

  // Base URL for images
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Function to get provider ID from API data by matching key
  const getProviderId = useCallback(
    (providerKey) => {
      if (!allProvidersData || !Array.isArray(allProvidersData)) {
        return null;
      }

      const matchingProvider = allProvidersData.find(
        (apiProvider) =>
          apiProvider.name.toLowerCase() === providerKey.toLowerCase(),
      );

      return matchingProvider ? matchingProvider.id : null;
    },
    [allProvidersData],
  );

  // Get first 2 slot providers with real-time data
  const slotProviders = useMemo(() => {
    // Function to get provider ID from API data by matching key
    const getProviderIdLocal = (providerKey) => {
      if (!allProvidersData || !Array.isArray(allProvidersData)) {
        return null;
      }

      const matchingProvider = allProvidersData.find(
        (apiProvider) =>
          apiProvider.name.toLowerCase() === providerKey.toLowerCase(),
      );

      return matchingProvider ? matchingProvider.id : null;
    };

    const providers = [
      {
        key: 'TOMHORN_SLOT',
        id: getProviderIdLocal('TOMHORN_SLOT'),
        icon: 'sp-8-5.webp',
        name: 'Tom Horn Gaming',
        isLive: true,
      },
      {
        key: 'MICRO_Slot',
        id: getProviderIdLocal('MICRO_Slot'),
        icon: 'sp-4-5.webp',
        name: 'Microgaming',
        isLive: true,
      },
    ];

    // Always show both providers, even if ID is not yet loaded
    // The click handler will check if ID exists before navigating
    return providers.slice(0, 2);
  }, [allProvidersData]);

  // Get first 2 live casino providers with real-time data
  const casinoProviders = useMemo(() => {
    const providers = [
      {
        key: 'evolution',
        id: '1382',
        provider: 'evolution',
        name: 'Evolution',
        background: 'evolution-5.webp',
        isLive: true,
      },
      {
        key: 'dream_gaming',
        id: '1356',
        provider: 'dream_gaming',
        name: 'Dream Gaming',
        background: 'dream-gaming-5.webp',
        isLive: true,
      },
    ];

    return providers.filter((provider) => provider.id).slice(0, 2);
  }, []);

  // Handle slot provider click - navigate to slot detail page
  const handleSlotProviderClick = useCallback(
    (provider) => {
      // Get the ID if not already set (in case API data loaded after component mount)
      const providerId = provider.id || getProviderId(provider.key);

      if (provider.isLive && providerId) {
        dispatch(setSelectedProviderId(providerId));
        router.push('/slots?category=slots');
      }
    },
    [dispatch, router, getProviderId],
  );

  // Handle casino provider click - launch game directly
  const handleCasinoProviderClick = useCallback(
    (provider) => {
      if (!provider.isLive || !provider.id) {
        return;
      }

      // On mobile screens, open modal
      if (isMobile) {
        const selectedGame = {
          id: provider.id,
          provider: provider.provider || provider.key,
          name: provider.name,
          image: `${baseUrl}/backgrounds/${provider.background}`,
        };
        dispatch(setSelectedGame(selectedGame));
        dispatch(openModal('launchGame'));
        return;
      }

      // On larger screens, launch directly
      handlePlayGame(provider.id);
    },
    [isMobile, dispatch, handlePlayGame, baseUrl],
  );

  return (
    <motion.aside
      className="template13-right-sidebar hidden w-64 flex-shrink-0 overflow-hidden border-l border-[#00374A] bg-[#00111A] lg:block lg:w-64 xl:w-64"
      initial={{ opacity: 0, x: 20 }}
      animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.1,
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      <div className="flex flex-col p-3">
        {/* Header */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <h2 className="text-lg font-semibold text-gray-300">
            {t('live_winners')}
          </h2>
        </motion.div>

        {/* Live Winners List */}
        <div
          className="scrollbar-live-winners flex-1 space-y-3 overflow-y-auto pr-2"
          style={{ maxHeight: 'calc(68vh - 100px)' }}
        >
          {displayWinners.slice(0, 10).map((winner, index) => (
            <motion.div
              key={winner.id || index}
              className="flex items-start gap-3 border-b border-[#20C5FE] pb-3"
              initial={{ opacity: 0, x: 20 }}
              animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.25 + index * 0.05,
              }}
              style={{ willChange: 'opacity, transform' }}
            >
              {/* Game Thumbnail */}
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[2px] border border-[#20C5FE] bg-gray-700">
                <LazyImage
                  src={winner.image}
                  alt={winner.gameName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Winner Info */}
              <div className="min-w-0 flex-1">
                {/* Winning Amount */}
                <div className="mb-1 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1 rounded border border-[#20C5FE] bg-[#20C5FE]/10 px-2 py-1">
                    <LazyImage
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-winner-money-5.svg"
                      alt="Money icon"
                      width={12}
                      height={12}
                      className="h-5 w-5"
                    />
                    <span className="text-sm font-medium text-white">
                      {formatAmountInMillions(winner.winningAmount)}{' '}
                      {getCurrency()}
                    </span>
                  </div>
                </div>

                {/* User and Game Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-gray-400">
                    {winner.maskedUsername}
                  </span>
                  <span className="truncate text-gray-400">
                    {winner.gameName}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Slots Section */}
        <motion.div
          className="mt-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <h3 className="mb-3 text-base font-semibold text-gray-300">
            {t('top_slots')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {slotProviders.map((provider, index) => (
              <motion.div
                key={provider.key || index}
                className="group cursor-pointer overflow-hidden rounded-[2px] border border-[#00374A] transition-all duration-300 hover:border-[#20C5FE]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.1 + index * 0.1,
                }}
                style={{ willChange: 'opacity, transform' }}
                onClick={() => handleSlotProviderClick(provider)}
              >
                <LazyImage
                  src={`${baseUrl}/icons/${provider.icon}`}
                  alt={provider.name || 'Slot Provider'}
                  width={240}
                  height={120}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Casinos Section */}
        <motion.div
          className="mt-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <h3 className="mb-3 text-base font-semibold text-gray-300">
            {t('top_casinos')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {casinoProviders.map((provider, index) => (
              <motion.div
                key={provider.key || index}
                className="group cursor-pointer overflow-hidden rounded-[2px] border border-[#00374A] transition-all duration-300 hover:border-[#20C5FE]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.1 + index * 0.1,
                }}
                style={{ willChange: 'opacity, transform' }}
                onClick={() => handleCasinoProviderClick(provider)}
              >
                <LazyImage
                  src={`${baseUrl}/backgrounds/${provider.background}`}
                  alt={provider.name || 'Casino Provider'}
                  width={240}
                  height={120}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Get in Touch Section */}
        <motion.div
          className="mt-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <h3 className="mb-3 text-base font-semibold text-gray-400">
            {t('get_in_touch')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Telegram Button */}
            <motion.button
              className="flex h-10 items-center justify-center gap-2.5 rounded-[34px] border-2 border-transparent bg-[#2AABEE] px-4 py-1 text-sm font-semibold text-white transition-all duration-200 ease-out hover:border-[#2AABEE] hover:bg-transparent hover:opacity-90"
              style={{ willChange: 'opacity, transform' }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.1,
              }}
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/telegram.svg"
                alt="Telegram"
                width={24}
                height={24}
              />
              <span className="text-[10px]">{t('telegram')}</span>
            </motion.button>

            {/* WhatsApp Button */}
            <motion.button
              className="flex h-10 items-center justify-center gap-2.5 rounded-[34px] border-2 border-transparent bg-[#60D669] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:border-[#60D669] hover:bg-transparent hover:opacity-90"
              style={{ willChange: 'opacity, transform' }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.2,
              }}
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/whatsapp.svg"
                alt="WhatsApp"
                width={24}
                height={24}
              />
              <span className="text-[10px]">{t('whatsapp')}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
});

export default RightSidebar;
