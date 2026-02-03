'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template18/components/LazyImage/LazyImage';
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
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next/next';

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
      icon: 'sp-3-13.png',
      logo: 'bighit.png',
      name: 'The Bighit',
      isLive: true,
    },
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-13.png',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-13.png',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-13.png',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-13.png',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-13.png',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-13.png',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-13.png',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'pocket_soft_gaming',
      id: getProviderId('pocket_soft_gaming'),
      icon: 'sp-10-13.png',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: false,
    },
    {
      key: '1x2_gaming',
      id: getProviderId('1x2_gaming'),
      icon: 'sp-11-13.png',
      logo: '1x2network.png',
      name: '1x2 Gaming',
      isLive: false,
    },
    {
      key: 'avatar_ux',
      id: getProviderId('avatar_ux'),
      icon: 'sp-12-13.png',
      logo: 'avatar-ux.png',
      name: 'Avatar UX',
      isLive: false,
    },
    {
      key: 'bgaming',
      id: getProviderId('bgaming'),
      icon: 'sp-13-13.png',
      logo: 'Bgaming.png',
      name: 'BGaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming',
      id: getProviderId('big_time_gaming'),
      icon: 'sp-14-13.png',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'one_touch',
      id: getProviderId('one_touch'),
      icon: 'sp-32-13.png',
      logo: 'Onetouch.png',
      name: 'One Touch',
      isLive: false,
    },
    {
      key: 'penguin_king',
      id: getProviderId('penguin_king'),
      icon: 'sp-69-13.png',
      logo: 'Penguin King.png',
      name: 'Penguin King',
      isLive: false,
    },
    {
      key: 'gameart',
      id: getProviderId('gameart'),
      icon: 'sp-53-13.png',
      logo: 'game-art.png',
      name: 'GameArt',
      isLive: false,
    },
    {
      key: 'gameplay_interractive',
      id: getProviderId('gameplay_interractive'),
      icon: 'sp-55-13.png',
      logo: 'gp-int.png',
      name: 'Gameplay Interractive',
      isLive: false,
    },
    {
      key: 'playtech',
      id: getProviderId('playtech'),
      icon: 'sp-56-13.png',
      logo: 'playtech.png',
      name: 'Playtech',
      isLive: false,
    },
    {
      key: 'skywind',
      id: getProviderId('skywind'),
      icon: 'sp-57-13.png',
      logo: 'skywind.png',
      name: 'Skywind',
      isLive: false,
    },
    {
      key: 'gtf',
      id: getProviderId('gtf'),
      icon: 'sp-58-13.png',
      logo: 'GTF.png',
      name: 'GTF',
      isLive: false,
    },
    {
      key: 'db_gaming',
      id: getProviderId('db_gaming'),
      icon: 'sp-68-13.png',
      logo: 'db-logo.png',
      name: 'DB Gaming',
      isLive: false,
    },
    {
      key: 'playson',
      id: getProviderId('playson'),
      icon: 'sp-33-13.png',
      logo: 'Playson-banner 2.png',
      name: 'Playson',
      isLive: false,
    },
    {
      key: 'playstar',
      id: getProviderId('playstar'),
      icon: 'sp-34-13.png',
      logo: 'Playstar.png',
      name: 'Playstar',
      isLive: false,
    },
    {
      key: 'quickspin',
      id: getProviderId('quickspin'),
      icon: 'sp-36-13.png',
      logo: 'quickspin-logo 2.png',
      name: 'Quickspin',
      isLive: false,
    },
    {
      key: 'push_gaming',
      id: getProviderId('push_gaming'),
      icon: 'sp-35-13.png',
      logo: 'pushGaming.png',
      name: 'Push Gaming',
      isLive: false,
    },
    {
      key: 'realtime_gaming',
      id: getProviderId('realtime_gaming'),
      icon: 'sp-37-13.png',
      logo: 'Realtime.png',
      name: 'Realtime Gaming',
      isLive: false,
    },
    {
      key: 'red_rake',
      id: getProviderId('red_rake'),
      icon: 'sp-38-13.png',
      logo: 'RedRake.png',
      name: 'Red Rake',
      isLive: false,
    },
    {
      key: 'red_tiger',
      id: getProviderId('red_tiger'),
      icon: 'sp-39-13.png',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: false,
    },
    {
      key: 'relax_gaming',
      id: getProviderId('relax_gaming'),
      icon: 'sp-40-13.png',
      logo: 'RelaxGaming 2.png',
      name: 'Relax Gaming',
      isLive: false,
    },
    {
      key: 'revolver_gaming',
      id: getProviderId('revolver_gaming'),
      icon: 'sp-41-13.png',
      logo: 'Revolver Gaming.png',
      name: 'Revolver Gaming',
      isLive: false,
    },
    {
      key: 'slotmill',
      id: getProviderId('slotmill'),
      icon: 'sp-42-13.png',
      logo: 'slotmill-logo-min 2.png',
      name: 'Slotmill',
      isLive: false,
    },
    {
      key: 'slotopia',
      id: getProviderId('slotopia'),
      icon: 'sp-43-13.png',
      logo: 'slotopia.png',
      name: 'Slotopia',
      isLive: false,
    },
    {
      key: 'thunderkick',
      id: getProviderId('thunderkick'),
      icon: 'sp-44-13.png',
      logo: 'ThunderKick.png',
      name: 'Thunderkick',
      isLive: false,
    },
    {
      key: 'top_trend',
      id: getProviderId('top_trend'),
      icon: 'sp-45-13.png',
      logo: 'TopTrend.png',
      name: 'Top Trend',
      isLive: false,
    },
    {
      key: 'tpg',
      id: getProviderId('tpg'),
      icon: 'sp-46-13.png',
      logo: 'TPG.png',
      name: 'TPG',
      isLive: false,
    },
    {
      key: 'twain_sport',
      id: getProviderId('twain_sport'),
      icon: 'sp-47-13.png',
      logo: 'Twain Sport.png',
      name: 'Twain Sport',
      isLive: false,
    },
    {
      key: 'voltent',
      id: getProviderId('voltent'),
      icon: 'sp-48-13.png',
      logo: 'voltent_m 2.png',
      name: 'Voltent',
      isLive: false,
    },
    {
      key: 'yggdrasil',
      id: getProviderId('yggdrasil'),
      icon: 'sp-50-13.png',
      logo: 'YGGRASIL.png',
      name: 'Yggdrasil',
      isLive: false,
    },
    {
      key: 'world_match',
      id: getProviderId('world_match'),
      icon: 'sp-49-13.png',
      logo: 'WorldMatch.png',
      name: 'World Match',
      isLive: false,
    },
    {
      key: 'fat_panda',
      id: getProviderId('fat_panda'),
      icon: 'sp-51-13.png',
      logo: 'Fatpanda.png',
      name: 'Fat Panda',
      isLive: false,
    },
    {
      key: 'fantasma',
      id: getProviderId('fantasma'),
      icon: 'sp-52-13.png',
      logo: 'Fantasma.png',
      name: 'Fantasma',
      isLive: false,
    },
    {
      key: 'no_limit_city',
      id: getProviderId('no_limit_city'),
      icon: 'sp-29-13.png',
      logo: 'Nolimit City.png',
      name: 'No Limit City',
      isLive: false,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-13.png',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: false,
    },
    {
      key: 'kiron',
      id: getProviderId('kiron'),
      icon: 'sp-25-13.png',
      logo: 'Kiron.png',
      name: 'Kiron',
      isLive: false,
    },
    {
      key: 'leap_gaming',
      id: getProviderId('leap_gaming'),
      icon: 'sp-26-13.png',
      logo: 'Leap.png',
      name: 'Leap Gaming',
      isLive: false,
    },
    {
      key: 'leap',
      id: getProviderId('leap'),
      icon: 'sp-31-13.png',
      logo: 'leap.png',
      name: 'Leap',
      isLive: false,
    },
    {
      key: 'mobilots',
      id: getProviderId('mobilots'),
      icon: 'sp-27-13.png',
      logo: 'Mobilots.png',
      name: 'Mobilots',
      isLive: false,
    },
    {
      key: 'kalamba',
      id: getProviderId('kalamba'),
      icon: 'sp-24-13.png',
      logo: 'Kalamba.png',
      name: 'Kalamba',
      isLive: false,
    },
    {
      key: 'jdp_gaming',
      id: getProviderId('jdp_gaming'),
      icon: 'sp-23-13.png',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: false,
    },
    {
      key: 'jili_games',
      id: getProviderId('jili_games'),
      icon: 'sp-22-13.png',
      logo: 'JiliGames.png',
      name: 'Jili Games',
      isLive: false,
    },
    {
      key: 'iron_dog',
      id: getProviderId('iron_dog'),
      icon: 'sp-21-13.png',
      logo: 'IronDog.png',
      name: 'Iron Dog',
      isLive: false,
    },
    {
      key: 'hacksaw',
      id: getProviderId('hacksaw'),
      icon: 'sp-20-13.png',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: false,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-18-13.png',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: false,
    },
    {
      key: 'genesis',
      id: getProviderId('genesis'),
      icon: 'sp-19-13.png',
      logo: 'GENESIS.png',
      name: 'Genesis',
      isLive: false,
    },
    {
      key: 'novomatic',
      id: getProviderId('novomatic'),
      icon: 'sp-30-13.png',
      logo: 'novomatic.png',
      name: 'Novomatic',
      isLive: false,
    },
    {
      key: 'dragon_soft',
      id: getProviderId('dragon_soft'),
      icon: 'sp-17-13.png',
      logo: 'DragonSoft.png',
      name: 'Dragon Soft',
      isLive: false,
    },
    {
      key: 'blueprint',
      id: getProviderId('blueprint'),
      icon: 'sp-15-13.png',
      logo: 'Blueprint.png',
      name: 'Blueprint',
      isLive: false,
    },
    {
      key: 'bng',
      id: getProviderId('bng'),
      icon: 'sp-16-13.png',
      logo: 'BNG.png',
      name: 'BNG',
      isLive: false,
    },
    {
      key: 'creative_gaming',
      id: getProviderId('creative_gaming'),
      icon: 'sp-67-13.png',
      logo: 'cg-3.png',
      name: 'Creative Gaming',
      isLive: false,
    },
    {
      key: 'live_22',
      id: getProviderId('live_22'),
      icon: 'sp-66-13.png',
      logo: 'live22-3.png',
      name: 'Live 22',
      isLive: false,
    },
    {
      key: '7_mojos',
      id: getProviderId('7_mojos'),
      icon: 'sp-65-13.png',
      logo: '7mojos-3.png',
      name: '7 Mojos',
      isLive: false,
    },
    {
      key: 'spinomenal',
      id: getProviderId('spinomenal'),
      icon: 'sp-64-13.png',
      logo: 'spinomental-3.png',
      name: 'Spinomenal',
      isLive: false,
    },
    {
      key: 'booming_games',
      id: getProviderId('booming_games'),
      icon: 'sp-63-13.png',
      logo: 'booming-game-3.png',
      name: 'Booming games',
      isLive: false,
    },
    {
      key: 'ask_me',
      id: getProviderId('ask_me'),
      icon: 'sp-62-13.png',
      logo: 'askme-3.png',
      name: 'Ask me',
      isLive: false,
    },
    {
      key: 'advant_play',
      id: getProviderId('advant_play'),
      icon: 'sp-61-13.png',
      logo: 'advant-play-3.png',
      name: 'Advant Play',
      isLive: false,
    },
    {
      key: 'yellow_bet',
      id: getProviderId('yellow_bet'),
      icon: 'sp-60-13.png',
      logo: 'yellow-bet-3.png',
      name: 'Yellow bet',
      isLive: false,
    },
    {
      key: 'spade_game',
      id: getProviderId('spade_game'),
      icon: 'sp-59-13.png',
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
  }, [staticProviders, searchQuery]);

  return (
    <div className="text-white [&_.bg-gradient-to-t]:hidden [&_.group]:border-0 [&_.group]:bg-transparent [&_.group]:shadow-none">
      {/* Slot Providers Hero Banner - Same structure as Live Casino */}
      <section
        className="relative mx-auto w-full max-w-[1580px] px-4 py-4 md:px-6 md:py-6"
        aria-label="Live Casino Hero"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* Main Banner - Left 9 Cols */}
          <div className="group relative overflow-hidden rounded-[14px] !border border-[#FFB7034D] md:col-span-9">
            <div className="relative h-[450px] w-full md:h-[400px]">
              {/* Desktop Image */}
              <div className="hidden md:block">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+BN.png"
                  alt="Main Banner"
                  fill
                  className="object-cover transition-transform duration-700"
                  priority
                />
              </div>
              {/* Mobile Image */}
              <div className="block md:hidden">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+Bn+Mob.png"
                  alt="Main Banner Mobile"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Content Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col justify-start p-6 md:justify-center md:p-12">
                <div className="mb-2 text-[12px] font-bold tracking-[0.2em] text-[#DFA336] uppercase md:text-[14px]">
                  SLOTS
                </div>
                <h1
                  className="mb-4 text-[24px] leading-tight font-bold text-white uppercase md:mb-8 md:text-[42px]"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  YOUR SLOTS, <br /> ANYTIME, ANYWHERE
                </h1>
                <button className="flex w-fit items-center gap-2 rounded-[5px] bg-[#FFB703] px-4 py-2 text-[14px] font-bold text-white transition-opacity hover:opacity-90 md:px-6 md:py-3">
                  PLAY NOW
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* App Download Box - Right 3 Cols */}
          <div className="relative mx-auto flex h-[169px] w-[370px] flex-col justify-between overflow-hidden rounded-[14px] border border-[#FFB7034D] p-4 md:col-span-3 md:mx-0 md:h-auto md:min-h-[300px] md:w-auto md:p-6">
            {/* Background Texture/Image Overlay */}
            <div className="absolute inset-0">
              {/* Desktop Image */}
              <div className="absolute inset-0 hidden opacity-40 md:block">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download-App-Section-18.png"
                  alt="App Interface"
                  fill
                  className="object-cover object-right-top"
                />
              </div>
              {/* Mobile Image */}
              <div className="absolute inset-0 block md:hidden">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download+Mob.png"
                  alt="App Interface Mobile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="relative z-10 px-2 md:px-0">
              <h2
                className="text-[20px] leading-tight font-bold text-white uppercase md:text-[28px]"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                GET OUR <br className="hidden md:block" /> APP
              </h2>
            </div>

            <div className="relative z-10 flex flex-col items-start justify-center gap-2 md:gap-4">
              <div className="rounded-lg bg-transparent p-1">
                <div className="h-[60px] w-[60px] rounded-md bg-white p-1 md:h-[120px] md:w-[120px]">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/QR.png"
                    alt="QR Code"
                    width={100}
                    height={100}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <p className="max-w-[150px] text-left text-[10px] font-bold tracking-widest text-[#FFB703] uppercase md:max-w-none md:text-[12px]">
                DOWNLOAD FOR BETTER EXPERIENCE
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-2 md:px-0">
        {/* Search Container */}
        <div className="mb-6 w-full">
          <div
            className="flex items-center rounded-[5px] px-3 md:rounded-[10px] md:px-6"
            style={{
              border: '1px solid #FFB7034D',
              background: '#14213D',
            }}
          >
            {/* Title with border separator */}
            <div
              className="flex items-center pr-3 md:pr-6"
              style={{
                borderRight: '1px solid #FFB7034D',
              }}
            >
              <h3 className="font-bring-race py-3 text-[10px] tracking-wide text-white uppercase md:py-4 md:text-[16px]">
                <span className="font-bring-race md:hidden">
                  {t('providers')}
                </span>
                <span className="font-bring-race hidden md:inline">
                  {t('slot_providers')}
                </span>
              </h3>
            </div>

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
                width="23"
                height="23"
                viewBox="0 0 23 23"
                fill="none"
              >
                <path
                  d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                  stroke="#FFB703"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Slot Providers Grid */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <img
              src={`${baseUrl}/backgrounds/lines-pattern.svg`}
              alt="Lines Pattern"
              className="h-full w-full object-cover"
            />
          </div>

          {/* 5-column grid on large screens */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProviders.map((provider) => (
              <div key={provider.key} className="w-full">
                <div className="group relative w-full overflow-hidden border border-purple-500/20 bg-black/20 shadow-sm transition-all duration-300 hover:border-[#E8D25E] hover:shadow-[0_0_10px_0_#FC7E09_inset]">
                  <div className="relative w-full bg-transparent">
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
                    {/* Hover Overlay - Only on Image */}
                    <div className="absolute inset-0 z-20 bg-[#14213DCC] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                        className="rounded-[45px] border-2 px-10 py-2 text-sm font-semibold shadow-md transition-colors hover:brightness-110"
                        style={{
                          backgroundColor: '#FFB703',
                          borderColor: '#FFB703',
                          color: '#000000',
                        }}
                      >
                        PLAY
                      </button>
                    </div>
                  </div>
                </div>
                {/* Provider Name - Below Card */}
                <div className="mt-2 text-center">
                  <span
                    className="text-sm text-white uppercase sm:text-base md:text-[24px]"
                    style={{ fontFamily: 'var(--font-king-town)' }}
                  >
                    {provider.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
