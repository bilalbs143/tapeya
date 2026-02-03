'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template10/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllProvider } from '@/website/websiteAction.js';
import { setSelectedProviderId } from '@/website/websiteSlice.js';

export default function SlotProvidersPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const { allProvidersData } = useSelector((state) => state.website);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Base URL already used across the site
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Function to get provider ID from API data by matching key
  const getProviderId = (providerKey) => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) {
      return null;
    }

    const matchingProvider = allProvidersData.find(
      (apiProvider) =>
        apiProvider.name.toLowerCase() === providerKey.toLowerCase(),
    );

    return matchingProvider ? matchingProvider.id : null;
  };

  // Handle play button click
  const handlePlayClick = (provider) => {
    if (provider.isLive && provider.id) {
      dispatch(setSelectedProviderId(provider.id));
      router.push('/slots');
    } else {
      toast.info(t('coming_soon'));
    }
  };

  // Static providers data with dynamic IDs
  const staticProviders = [
    {
      key: 'thebighit',
      id: getProviderId('thebighit'),
      icon: 'sp-3-10.webp',
      logo: 'bighit.png',
      name: 'The Bighit',
      isLive: true,
    },
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-10.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-10.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-10.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-10.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-10.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-10.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-10.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'pocket_soft_gaming',
      id: getProviderId('pocket_soft_gaming'),
      icon: 'sp-10-10.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: false,
    },
    {
      key: '1x2_gaming',
      id: getProviderId('1x2_gaming'),
      icon: 'sp-11-10.webp',
      logo: '1x2network.png',
      name: '1x2 Gaming',
      isLive: false,
    },
    {
      key: 'avatar_ux',
      id: getProviderId('avatar_ux'),
      icon: 'sp-12-10.webp',
      logo: 'avatar-ux.png',
      name: 'Avatar UX',
      isLive: false,
    },
    {
      key: 'bgaming',
      id: getProviderId('bgaming'),
      icon: 'sp-13-10.webp',
      logo: 'Bgaming.png',
      name: 'BGaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming',
      id: getProviderId('big_time_gaming'),
      icon: 'sp-32-10.webp',
      logo: 'Onetouch.png',
      name: 'One Touch',
      isLive: false,
    },
    {
      key: 'penguin_king',
      id: getProviderId('penguin_king'),
      icon: 'sp-31-10.webp',
      logo: 'Penguin King.png',
      name: 'Penguin King',
      isLive: false,
    },
    {
      key: 'gameart',
      id: getProviderId('gameart'),
      icon: 'sp-53-10.webp',
      logo: 'game-art.png',
      name: 'GameArt',
      isLive: false,
    },
    {
      key: 'playson',
      id: getProviderId('playson'),
      icon: 'sp-33-10.webp',
      logo: 'Playson-banner 2.png',
      name: 'Playson',
      isLive: false,
    },
    {
      key: 'playstar',
      id: getProviderId('playstar'),
      icon: 'sp-34-10.webp',
      logo: 'Playstar.png',
      name: 'Playstar',
      isLive: false,
    },
    {
      key: 'quickspin',
      id: getProviderId('quickspin'),
      icon: 'sp-36-10.webp',
      logo: 'quickspin-logo 2.png',
      name: 'Quickspin',
      isLive: false,
    },
    {
      key: 'push_gaming',
      id: getProviderId('push_gaming'),
      icon: 'sp-35-10.webp',
      logo: 'pushGaming.png',
      name: 'Push Gaming',
      isLive: false,
    },
    {
      key: 'realtime_gaming',
      id: getProviderId('realtime_gaming'),
      icon: 'sp-37-10.webp',
      logo: 'Realtime.png',
      name: 'Realtime Gaming',
      isLive: false,
    },
    {
      key: 'red_rake',
      id: getProviderId('red_rake'),
      icon: 'sp-38-10.webp',
      logo: 'RedRake.png',
      name: 'Red Rake',
      isLive: false,
    },
    {
      key: 'red_tiger',
      id: getProviderId('red_tiger'),
      icon: 'sp-39-10.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: false,
    },
    {
      key: 'relax_gaming',
      id: getProviderId('relax_gaming'),
      icon: 'sp-40-10.webp',
      logo: 'RelaxGaming 2.png',
      name: 'Relax Gaming',
      isLive: false,
    },
    {
      key: 'revolver_gaming',
      id: getProviderId('revolver_gaming'),
      icon: 'sp-41-10.webp',
      logo: 'Revolver Gaming.png',
      name: 'Revolver Gaming',
      isLive: false,
    },
    {
      key: 'slotmill',
      id: getProviderId('slotmill'),
      icon: 'sp-42-10.webp',
      logo: 'slotmill-logo-min 2.png',
      name: 'Slotmill',
      isLive: false,
    },
    {
      key: 'slotopia',
      id: getProviderId('slotopia'),
      icon: 'sp-43-10.webp',
      logo: 'slotopia.png',
      name: 'Slotopia',
      isLive: false,
    },
    {
      key: 'thunderkick',
      id: getProviderId('thunderkick'),
      icon: 'sp-44-10.webp',
      logo: 'ThunderKick.png',
      name: 'Thunderkick',
      isLive: false,
    },
    {
      key: 'top_trend',
      id: getProviderId('top_trend'),
      icon: 'sp-45-10.webp',
      logo: 'TopTrend.png',
      name: 'Top Trend',
      isLive: false,
    },
    {
      key: 'tpg',
      id: getProviderId('tpg'),
      icon: 'sp-46-10.webp',
      logo: 'TPG.png',
      name: 'TPG',
      isLive: false,
    },
    {
      key: 'twain_sport',
      id: getProviderId('twain_sport'),
      icon: 'sp-47-10.webp',
      logo: 'Twain Sport.png',
      name: 'Twain Sport',
      isLive: false,
    },
    {
      key: 'voltent',
      id: getProviderId('voltent'),
      icon: 'sp-48-10.webp',
      logo: 'voltent_m 2.png',
      name: 'Voltent',
      isLive: false,
    },
    {
      key: 'yggdrasil',
      id: getProviderId('yggdrasil'),
      icon: 'sp-50-10.webp',
      logo: 'YGGRASIL.png',
      name: 'Yggdrasil',
      isLive: false,
    },
    {
      key: 'world_match',
      id: getProviderId('world_match'),
      icon: 'sp-49-10.webp',
      logo: 'WorldMatch.png',
      name: 'World Match',
      isLive: false,
    },
    {
      key: 'fat_panda',
      id: getProviderId('fat_panda'),
      icon: 'sp-51-10.webp',
      logo: 'Fatpanda.png',
      name: 'Fat Panda',
      isLive: false,
    },
    {
      key: 'fantasma',
      id: getProviderId('fantasma'),
      icon: 'sp-52-10.webp',
      logo: 'Fantasma.png',
      name: 'Fantasma',
      isLive: false,
    },
    {
      key: 'no_limit_city',
      id: getProviderId('no_limit_city'),
      icon: 'sp-29-10.webp',
      logo: 'Nolimit City.png',
      name: 'No Limit City',
      isLive: false,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-10.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: false,
    },
    {
      key: 'kiron',
      id: getProviderId('kiron'),
      icon: 'sp-25-10.webp',
      logo: 'Kiron.png',
      name: 'Kiron',
      isLive: false,
    },
    {
      key: 'leap_gaming',
      id: getProviderId('leap_gaming'),
      icon: 'sp-26-10.webp',
      logo: 'Leap.png',
      name: 'Leap Gaming',
      isLive: false,
    },
    {
      key: 'mobilots',
      id: getProviderId('mobilots'),
      icon: 'sp-27-10.webp',
      logo: 'Mobilots.png',
      name: 'Mobilots',
      isLive: false,
    },
    {
      key: 'kalamba',
      id: getProviderId('kalamba'),
      icon: 'sp-24-10.webp',
      logo: 'Kalamba.png',
      name: 'Kalamba',
      isLive: false,
    },
    {
      key: 'jdp_gaming',
      id: getProviderId('jdp_gaming'),
      icon: 'sp-23-10.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: false,
    },
    {
      key: 'jili_games',
      id: getProviderId('jili_games'),
      icon: 'sp-22-10.webp',
      logo: 'JiliGames.png',
      name: 'Jili Games',
      isLive: false,
    },
    {
      key: 'iron_dog',
      id: getProviderId('iron_dog'),
      icon: 'sp-21-10.webp',
      logo: 'IronDog.png',
      name: 'Iron Dog',
      isLive: false,
    },
    {
      key: 'hacksaw',
      id: getProviderId('hacksaw'),
      icon: 'sp-20-10.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: false,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-18-10.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: false,
    },
    {
      key: 'novomatic',
      id: getProviderId('novomatic'),
      icon: 'sp-30-10.webp',
      logo: 'novomatic.png',
      name: 'Novomatic',
      isLive: false,
    },
    {
      key: 'dragon_soft',
      id: getProviderId('dragon_soft'),
      icon: 'sp-17-10.webp',
      logo: 'DragonSoft.png',
      name: 'Dragon Soft',
      isLive: false,
    },
    {
      key: 'blueprint',
      id: getProviderId('blueprint'),
      icon: 'sp-15-10.webp',
      logo: 'Blueprint.png',
      name: 'Blueprint',
      isLive: false,
    },
    {
      key: 'bng',
      id: getProviderId('bng'),
      icon: 'sp-16-10.webp',
      logo: 'BNG.png',
      name: 'BNG',
      isLive: false,
    },
    {
      key: 'big_time_gaming_2',
      id: getProviderId('big_time_gaming_2'),
      icon: 'sp-14-10.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'creative_gaming',
      id: getProviderId('creative_gaming'),
      icon: 'sp-67-10.webp',
      logo: 'cg-3.png',
      name: 'Creative Gaming',
      isLive: false,
    },
    {
      key: 'live_22',
      id: getProviderId('live_22'),
      icon: 'sp-66-10.webp',
      logo: 'live22-3.png',
      name: 'Live 22',
      isLive: false,
    },
    {
      key: '7_mojos',
      id: getProviderId('7_mojos'),
      icon: 'sp-65-10.webp',
      logo: '7mojos-3.png',
      name: '7 Mojos',
      isLive: false,
    },
    {
      key: 'spinomenal',
      id: getProviderId('spinomenal'),
      icon: 'sp-64-10.webp',
      logo: 'spinomental-3.png',
      name: 'Spinomenal',
      isLive: false,
    },
    {
      key: 'booming_games',
      id: getProviderId('booming_games'),
      icon: 'sp-63-10.webp',
      logo: 'booming-game-3.png',
      name: 'Booming games',
      isLive: false,
    },
    {
      key: 'ask_me',
      id: getProviderId('ask_me'),
      icon: 'sp-62-10.webp',
      logo: 'askme-3.png',
      name: 'Ask me',
      isLive: false,
    },
    {
      key: 'advant_play',
      id: getProviderId('advant_play'),
      icon: 'sp-61-10.webp',
      logo: 'advant-play-3.png',
      name: 'Advant Play',
      isLive: false,
    },
    {
      key: 'yellow_bet',
      id: getProviderId('yellow_bet'),
      icon: 'sp-60-10.webp',
      logo: 'yellow-bet-3.png',
      name: 'Yellow bet',
      isLive: false,
    },
    {
      key: 'spade_game',
      id: getProviderId('spade_game'),
      icon: 'sp-59-10.webp',
      logo: 'spade-game-3.png',
      name: 'Spade Game',
      isLive: false,
    },
  ];

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return staticProviders;
    const q = searchQuery.toLowerCase();
    return staticProviders.filter((p) =>
      [p.name, p.key].some((v) => (v || '').toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  return (
    <div className="text-white [&_.bg-gradient-to-t]:hidden [&_.group]:border-0 [&_.group]:bg-transparent [&_.group]:shadow-none">
      {/* Slot Providers Hero Banner */}
      <section
        className="relative mx-auto w-full overflow-hidden"
        aria-label={t('live_casino_banner')}
      >
        <div className="relative min-h-[200px] w-full overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-10.webp"
              alt={t('live_casino_background_alt')}
              width={1920}
              height={600}
              className="block h-auto w-full rounded-[5px] object-cover"
              priority
            />
          </div>

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <div className="relative block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-10.webp"
              alt={t('live_casino_mobile_background_alt')}
              width={1920}
              height={600}
              className="block h-auto w-full rounded-[5px] object-cover"
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-6 md:items-center md:justify-end md:pt-0 md:pr-24">
            <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
              <div className="flex flex-col items-start">
                {/* SLOTS */}
                <h3
                  className="text-left text-[14px] font-bold uppercase sm:text-base md:text-right md:text-lg lg:text-xl"
                  style={{
                    color: '#E33A24',
                    letterSpacing: '8px',
                  }}
                >
                  {t('slots').toUpperCase()}
                </h3>

                {/* BALANCE YOUR LUCK. */}
                <h2 className="font-spy-agency text-left text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-right md:text-lg lg:text-[25px] xl:text-[30px] 2xl:text-[30px]">
                  {t('balance_your_luck')}
                </h2>

                {/* ELEVATE YOUR GAME. */}
                <h2 className="font-spy-agency text-left text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-right md:text-lg lg:text-[25px] xl:text-[30px] 2xl:text-[30px]">
                  {t('elevate_your_game')}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-6">
        {/* Header */}
        <div className="mb-6 w-full">
          <div
            className="flex items-center rounded-[5px] border px-3 md:px-6"
            style={{
              border: '1px solid #E33A24',
              background:
                'linear-gradient(0deg, rgba(23, 47, 49, 0.80) 0%, rgba(23, 47, 49, 0.80) 100%)',
            }}
          >
            {/* Title */}
            <div className="flex items-center pr-3 md:pr-6">
              <h3
                className="font-bring-race py-3 text-[10px] tracking-wide uppercase md:py-4 md:text-[16px]"
                style={{
                  color: '#FFFFFF',
                }}
              >
                <span className="font-spy-agency md:hidden">
                  {t('providers')}
                </span>
                <span className="font-spy-agency hidden md:inline">
                  {t('slot_providers')}
                </span>
              </h3>
            </div>

            {/* Separator */}
            <div
              className="w-px self-stretch"
              style={{
                backgroundColor: '#E33A24',
              }}
            />

            {/* Search */}
            <div className="flex flex-1 items-center gap-2 pl-3 md:pl-4">
              <input
                type="text"
                placeholder={t('search_providers')}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-[23px] md:w-[23px]"
                viewBox="0 0 23 23"
                fill="none"
              >
                <path
                  d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <img
              src={`${baseUrl}/backgrounds/lines-pattern.svg`}
              alt="Lines Pattern"
              className="h-full w-full object-cover"
            />
          </div>

          {/* 5-column grid on large screens */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProviders.map((provider) => (
              <div
                key={provider.key}
                className="group relative w-full overflow-hidden shadow-sm transition-all duration-300"
              >
                <div className="relative w-full">
                  <div className="flex items-center justify-center">
                    <LazyImage
                      src={`${baseUrl}/icons/${provider.icon}`}
                      alt={provider.name}
                      width={200}
                      height={150}
                      className="h-auto w-full object-contain transition-transform duration-300"
                      quality={85}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  {/* Hover Overlay with backdrop blur */}
                  <div
                    className="absolute inset-0 z-20 opacity-0 backdrop-blur-[5px] transition-opacity duration-300 group-hover:opacity-100"
                    style={{ backgroundColor: 'rgba(36, 106, 115, 0.3)' }}
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="relative h-10 w-28 bg-transparent sm:h-12 sm:w-32 md:h-14 md:w-36">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LazyImage
                            src={`${baseUrl}/logos/${provider.logo}`}
                            alt={`${provider.name} logo`}
                            fill
                            sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                            className="object-contain"
                            quality={90}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayClick(provider)}
                        className="rounded-[5px] border-2 px-10 py-2 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
                        style={{
                          backgroundColor: '#E33A24',
                          borderColor: '#E33A24',
                        }}
                      >
                        {t('play')}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Provider Name - Below Image */}
                <div className="mt-4 text-center">
                  <div className="font-spy-agency text-[12px] font-medium text-white uppercase sm:text-[14px] md:text-[14px]">
                    {provider.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-0">
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-10.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-10.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Top on mobile, centered on desktop */}
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-8 sm:pt-6 md:items-center md:pt-0">
              <div className="w-auto max-w-[calc(100%-2rem)] text-center sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-center">
                  {/* JACKPOTS AREN'T FOUND-THEY'RE FORGED. */}
                  <h2 className="font-spy-agency text-center text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-lg lg:text-[20px] xl:text-[22px] 2xl:text-[27px]">
                    {t('jackpots_arent_found')}
                    <br />
                    {t('theyre_forged')}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
