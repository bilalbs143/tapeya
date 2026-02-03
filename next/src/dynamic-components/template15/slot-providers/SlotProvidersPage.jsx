'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template15/components/LazyImage/LazyImage';
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
      icon: 'sp-3-12.webp',
      logo: 'bighit.png',
      name: 'The Bighit',
      isLive: true,
    },
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-12.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-12.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-12.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-12.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-12.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-12.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-12.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'pocket_soft_gaming',
      id: getProviderId('pocket_soft_gaming'),
      icon: 'sp-10-12.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: false,
    },
    {
      key: '1x2_gaming',
      id: getProviderId('1x2_gaming'),
      icon: 'sp-11-12.webp',
      logo: '1x2network.png',
      name: '1x2 Gaming',
      isLive: false,
    },
    {
      key: 'avatar_ux',
      id: getProviderId('avatar_ux'),
      icon: 'sp-12-12.webp',
      logo: 'avatar-ux.png',
      name: 'Avatar UX',
      isLive: false,
    },
    {
      key: 'bgaming',
      id: getProviderId('bgaming'),
      icon: 'sp-13-12.webp',
      logo: 'Bgaming.png',
      name: 'BGaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming',
      id: getProviderId('big_time_gaming'),
      icon: 'sp-14-12.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'one_touch',
      id: getProviderId('one_touch'),
      icon: 'sp-32-12.webp',
      logo: 'Onetouch.png',
      name: 'One Touch',
      isLive: false,
    },
    {
      key: 'penguin_king',
      id: getProviderId('penguin_king'),
      icon: 'sp-69-12.webp',
      logo: 'Penguin King.png',
      name: 'Penguin King',
      isLive: false,
    },
    {
      key: 'gameart',
      id: getProviderId('gameart'),
      icon: 'sp-53-12.webp',
      logo: 'game-art.png',
      name: 'GameArt',
      isLive: false,
    },
    {
      key: 'gameplay_interractive',
      id: getProviderId('gameplay_interractive'),
      icon: 'sp-55-12.webp',
      logo: 'gp-int.png',
      name: 'Gameplay Interractive',
      isLive: false,
    },
    {
      key: 'playtech',
      id: getProviderId('playtech'),
      icon: 'sp-56-12.webp',
      logo: 'playtech.png',
      name: 'Playtech',
      isLive: false,
    },
    {
      key: 'skywind',
      id: getProviderId('skywind'),
      icon: 'sp-57-12.webp',
      logo: 'skywind.png',
      name: 'Skywind',
      isLive: false,
    },
    {
      key: 'gtf',
      id: getProviderId('gtf'),
      icon: 'sp-58-12.webp',
      logo: 'GTF.png',
      name: 'GTF',
      isLive: false,
    },
    {
      key: 'db_gaming',
      id: getProviderId('db_gaming'),
      icon: 'sp-68-12.webp',
      logo: 'db-logo.png',
      name: 'DB Gaming',
      isLive: false,
    },
    {
      key: 'playson',
      id: getProviderId('playson'),
      icon: 'sp-33-12.webp',
      logo: 'Playson-banner 2.png',
      name: 'Playson',
      isLive: false,
    },
    {
      key: 'playstar',
      id: getProviderId('playstar'),
      icon: 'sp-34-12.webp',
      logo: 'Playstar.png',
      name: 'Playstar',
      isLive: false,
    },
    {
      key: 'quickspin',
      id: getProviderId('quickspin'),
      icon: 'sp-36-12.webp',
      logo: 'quickspin-logo 2.png',
      name: 'Quickspin',
      isLive: false,
    },
    {
      key: 'push_gaming',
      id: getProviderId('push_gaming'),
      icon: 'sp-35-12.webp',
      logo: 'pushGaming.png',
      name: 'Push Gaming',
      isLive: false,
    },
    {
      key: 'realtime_gaming',
      id: getProviderId('realtime_gaming'),
      icon: 'sp-37-12.webp',
      logo: 'Realtime.png',
      name: 'Realtime Gaming',
      isLive: false,
    },
    {
      key: 'red_rake',
      id: getProviderId('red_rake'),
      icon: 'sp-38-12.webp',
      logo: 'RedRake.png',
      name: 'Red Rake',
      isLive: false,
    },
    {
      key: 'red_tiger',
      id: getProviderId('red_tiger'),
      icon: 'sp-39-12.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: false,
    },
    {
      key: 'relax_gaming',
      id: getProviderId('relax_gaming'),
      icon: 'sp-40-12.webp',
      logo: 'RelaxGaming 2.png',
      name: 'Relax Gaming',
      isLive: false,
    },
    {
      key: 'revolver_gaming',
      id: getProviderId('revolver_gaming'),
      icon: 'sp-41-12.webp',
      logo: 'Revolver Gaming.png',
      name: 'Revolver Gaming',
      isLive: false,
    },
    {
      key: 'slotmill',
      id: getProviderId('slotmill'),
      icon: 'sp-42-12.webp',
      logo: 'slotmill-logo-min 2.png',
      name: 'Slotmill',
      isLive: false,
    },
    {
      key: 'slotopia',
      id: getProviderId('slotopia'),
      icon: 'sp-43-12.webp',
      logo: 'slotopia.png',
      name: 'Slotopia',
      isLive: false,
    },
    {
      key: 'thunderkick',
      id: getProviderId('thunderkick'),
      icon: 'sp-44-12.webp',
      logo: 'ThunderKick.png',
      name: 'Thunderkick',
      isLive: false,
    },
    {
      key: 'top_trend',
      id: getProviderId('top_trend'),
      icon: 'sp-45-12.webp',
      logo: 'TopTrend.png',
      name: 'Top Trend',
      isLive: false,
    },
    {
      key: 'tpg',
      id: getProviderId('tpg'),
      icon: 'sp-46-12.webp',
      logo: 'TPG.png',
      name: 'TPG',
      isLive: false,
    },
    {
      key: 'twain_sport',
      id: getProviderId('twain_sport'),
      icon: 'sp-47-12.webp',
      logo: 'Twain Sport.png',
      name: 'Twain Sport',
      isLive: false,
    },
    {
      key: 'voltent',
      id: getProviderId('voltent'),
      icon: 'sp-48-12.webp',
      logo: 'voltent_m 2.png',
      name: 'Voltent',
      isLive: false,
    },
    {
      key: 'yggdrasil',
      id: getProviderId('yggdrasil'),
      icon: 'sp-50-12.webp',
      logo: 'YGGRASIL.png',
      name: 'Yggdrasil',
      isLive: false,
    },
    {
      key: 'world_match',
      id: getProviderId('world_match'),
      icon: 'sp-49-12.webp',
      logo: 'WorldMatch.png',
      name: 'World Match',
      isLive: false,
    },
    {
      key: 'fat_panda',
      id: getProviderId('fat_panda'),
      icon: 'sp-51-12.webp',
      logo: 'Fatpanda.png',
      name: 'Fat Panda',
      isLive: false,
    },
    {
      key: 'fantasma',
      id: getProviderId('fantasma'),
      icon: 'sp-52-12.webp',
      logo: 'Fantasma.png',
      name: 'Fantasma',
      isLive: false,
    },
    {
      key: 'no_limit_city',
      id: getProviderId('no_limit_city'),
      icon: 'sp-29-12.webp',
      logo: 'Nolimit City.png',
      name: 'No Limit City',
      isLive: false,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-12.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: false,
    },
    {
      key: 'kiron',
      id: getProviderId('kiron'),
      icon: 'sp-25-12.webp',
      logo: 'Kiron.png',
      name: 'Kiron',
      isLive: false,
    },
    {
      key: 'leap_gaming',
      id: getProviderId('leap_gaming'),
      icon: 'sp-26-12.webp',
      logo: 'Leap.png',
      name: 'Leap Gaming',
      isLive: false,
    },
    {
      key: 'leap',
      id: getProviderId('leap'),
      icon: 'sp-31-12.webp',
      logo: 'leap.png',
      name: 'Leap',
      isLive: false,
    },
    {
      key: 'mobilots',
      id: getProviderId('mobilots'),
      icon: 'sp-27-12.webp',
      logo: 'Mobilots.png',
      name: 'Mobilots',
      isLive: false,
    },
    {
      key: 'kalamba',
      id: getProviderId('kalamba'),
      icon: 'sp-24-12.webp',
      logo: 'Kalamba.png',
      name: 'Kalamba',
      isLive: false,
    },
    {
      key: 'jdp_gaming',
      id: getProviderId('jdp_gaming'),
      icon: 'sp-23-12.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: false,
    },
    {
      key: 'jili_games',
      id: getProviderId('jili_games'),
      icon: 'sp-22-12.webp',
      logo: 'JiliGames.png',
      name: 'Jili Games',
      isLive: false,
    },
    {
      key: 'iron_dog',
      id: getProviderId('iron_dog'),
      icon: 'sp-21-12.webp',
      logo: 'IronDog.png',
      name: 'Iron Dog',
      isLive: false,
    },
    {
      key: 'hacksaw',
      id: getProviderId('hacksaw'),
      icon: 'sp-20-12.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: false,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-18-12.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: false,
    },
    {
      key: 'genesis',
      id: getProviderId('genesis'),
      icon: 'sp-19-12.webp',
      logo: 'GENESIS.png',
      name: 'Genesis',
      isLive: false,
    },
    {
      key: 'novomatic',
      id: getProviderId('novomatic'),
      icon: 'sp-30-12.webp',
      logo: 'novomatic.png',
      name: 'Novomatic',
      isLive: false,
    },
    {
      key: 'dragon_soft',
      id: getProviderId('dragon_soft'),
      icon: 'sp-17-12.webp',
      logo: 'DragonSoft.png',
      name: 'Dragon Soft',
      isLive: false,
    },
    {
      key: 'blueprint',
      id: getProviderId('blueprint'),
      icon: 'sp-15-12.webp',
      logo: 'Blueprint.png',
      name: 'Blueprint',
      isLive: false,
    },
    {
      key: 'bng',
      id: getProviderId('bng'),
      icon: 'sp-16-12.webp',
      logo: 'BNG.png',
      name: 'BNG',
      isLive: false,
    },
    {
      key: 'creative_gaming',
      id: getProviderId('creative_gaming'),
      icon: 'sp-67-12.webp',
      logo: 'cg-3.png',
      name: 'Creative Gaming',
      isLive: false,
    },
    {
      key: 'live_22',
      id: getProviderId('live_22'),
      icon: 'sp-66-12.webp',
      logo: 'live22-3.png',
      name: 'Live 22',
      isLive: false,
    },
    {
      key: '7_mojos',
      id: getProviderId('7_mojos'),
      icon: 'sp-65-12.webp',
      logo: '7mojos-3.png',
      name: '7 Mojos',
      isLive: false,
    },
    {
      key: 'spinomenal',
      id: getProviderId('spinomenal'),
      icon: 'sp-64-12.webp',
      logo: 'spinomental-3.png',
      name: 'Spinomenal',
      isLive: false,
    },
    {
      key: 'booming_games',
      id: getProviderId('booming_games'),
      icon: 'sp-63-12.webp',
      logo: 'booming-game-3.png',
      name: 'Booming games',
      isLive: false,
    },
    {
      key: 'ask_me',
      id: getProviderId('ask_me'),
      icon: 'sp-62-12.webp',
      logo: 'askme-3.png',
      name: 'Ask me',
      isLive: false,
    },
    {
      key: 'advant_play',
      id: getProviderId('advant_play'),
      icon: 'sp-61-12.webp',
      logo: 'advant-play-3.png',
      name: 'Advant Play',
      isLive: false,
    },
    {
      key: 'yellow_bet',
      id: getProviderId('yellow_bet'),
      icon: 'sp-60-12.webp',
      logo: 'yellow-bet-3.png',
      name: 'Yellow bet',
      isLive: false,
    },
    {
      key: 'spade_game',
      id: getProviderId('spade_game'),
      icon: 'sp-59-12.webp',
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
        className="relative mx-auto w-full overflow-hidden px-2 md:mt-4 md:px-6"
        aria-label="Slot Providers Banner"
      >
        {/* Desktop Background Image - Hidden on mobile */}
        <div className="relative hidden w-full md:block">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SlotDesktopBanner-12.webp"
            alt="Slot Providers Background"
            width={1920}
            height={400}
            className="h-full w-full object-cover"
            priority
          />

          {/* Desktop Content Overlay */}
          <div className="absolute inset-0 z-10 flex items-end justify-end px-4 pb-32 sm:px-8 md:px-16 lg:px-32 lg:pb-20 xl:px-40">
            <div className="w-full max-w-[520px] text-left">
              <div className="mb-2 text-[14px] font-bold tracking-[6.4px] text-[#DFA336] uppercase sm:text-[16px] md:text-[18px] lg:text-[20px]">
                SLOTS
              </div>

              <h1
                className="text-[28px] leading-tight tracking-wide text-white sm:text-[36px] md:text-[40px] lg:text-[55px]"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                SLOTS POWER <br /> IN YOUR POCKET
              </h1>
            </div>
          </div>
        </div>

        {/* Mobile Background Image - Only visible on mobile */}
        <div className="relative mt-4 block w-full md:hidden">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SlotMobBanner-12.webp"
            alt="Slot Providers Background Mobile"
            width={1920}
            height={400}
            className="h-auto w-full object-contain"
            priority
          />

          {/* Mobile Content Overlay */}
          <div className="absolute inset-0 flex items-start justify-center pt-8">
            <div className="container mx-auto px-4">
              <div className="w-full text-center">
                {/* Headline and Subheadline (center aligned) */}
                <div className="text-center">
                  {/* SLOTS label */}
                  <div className="mb-2 text-[20px] tracking-[6.4px] text-[#DFA336] uppercase">
                    SLOTS
                  </div>
                  {/* Main Title */}
                  <h1
                    className="!text-[20px] leading-tight font-semibold tracking-wide text-white uppercase sm:!text-[24px]"
                    style={{
                      fontFamily: 'var(--font-king-town)',
                    }}
                  >
                    SLOTS POWER <br /> IN YOUR POCKET
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-2 pt-8 md:px-0">
        {/* Search Container */}
        <div className="mb-5 flex w-full flex-row items-center justify-between gap-2 md:gap-4">
          <div className="flex shrink-0 items-center">
            <h3
              className="text-[16px] font-normal tracking-wide text-[#CBBC91] uppercase sm:text-[20px] md:text-[24px]"
              style={{
                fontFamily: 'var(--font-king-town)',
              }}
            >
              {t('slot_providers')}
            </h3>
          </div>

          <div
            className="mb-5 flex w-[200px] items-center rounded-full border px-3 py-3 md:w-[270px] md:px-4 md:py-3"
            style={{
              border: '1px solid #CBBC9121',
              backgroundColor: '#151517',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4 shrink-0 md:mr-3 md:h-[24px] md:w-[24px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                stroke="#CBBC91"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Slot Providers..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#8B8B8B] md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    <div className="absolute inset-0 z-20 bg-[#0F50454D] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100" />
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
                          backgroundColor: '#CBBC91',
                          borderColor: '#CBBC91',
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
