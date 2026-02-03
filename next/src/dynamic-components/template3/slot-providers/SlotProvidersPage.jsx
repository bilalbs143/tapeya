'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template3/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllProvider } from '@/website/websiteAction.js';
import { setSelectedProviderId } from '@/website/websiteSlice.js';

export default function SlotProvidersPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const { allProvidersData } = useSelector((state) => state.website);

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
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-3-up.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-3-up.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-3-up.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-3-up.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-3-up.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-3-up.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-3-up.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'thebighit',
      id: getProviderId('thebighit'),
      icon: 'sp-3-3-up.webp',
      logo: 'bighit.png',
      name: 'The Bighit',
      isLive: true,
    },
    {
      key: 'pocket_soft_gaming',
      id: getProviderId('pocket_soft_gaming'),
      icon: 'sp-10-3-up.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: false,
    },
    {
      key: '1x2_gaming',
      id: getProviderId('1x2_gaming'),
      icon: 'sp-11-3-up.webp',
      logo: '1x2network.png',
      name: '1x2 Gaming',
      isLive: false,
    },
    {
      key: 'avatar_ux',
      id: getProviderId('avatar_ux'),
      icon: 'sp-12-3-up.webp',
      logo: 'avatar-ux.png',
      name: 'Avatar UX',
      isLive: false,
    },
    {
      key: 'bgaming',
      id: getProviderId('bgaming'),
      icon: 'sp-13-3-up.webp',
      logo: 'Bgaming.png',
      name: 'BGaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming',
      id: getProviderId('big_time_gaming'),
      icon: 'sp-14-3-up.webp',
      logo: 'Onetouch.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'penguin_king',
      id: getProviderId('penguin_king'),
      icon: 'sp-32-3-up.webp',
      logo: 'Penguin King.png',
      name: 'Penguin King',
      isLive: false,
    },
    {
      key: 'gameart',
      id: getProviderId('gameart'),
      icon: 'sp-64-3-up.webp',
      logo: 'game-art.png',
      name: 'GameArt',
      isLive: false,
    },
    {
      key: 'playson',
      id: getProviderId('playson'),
      icon: 'sp-33-3-up.webp',
      logo: 'Playson-banner 2.png',
      name: 'Playson',
      isLive: false,
    },
    {
      key: 'playstar',
      id: getProviderId('playstar'),
      icon: 'sp-34-3-up.webp',
      logo: 'Playstar.png',
      name: 'Playstar',
      isLive: false,
    },
    {
      key: 'quickspin',
      id: getProviderId('quickspin'),
      icon: 'sp-36-3-up.webp',
      logo: 'quickspin-logo 2.png',
      name: 'Quickspin',
      isLive: false,
    },
    {
      key: 'push_gaming',
      id: getProviderId('push_gaming'),
      icon: 'sp-35-3-up.webp',
      logo: 'pushGaming.png',
      name: 'Push Gaming',
      isLive: false,
    },
    {
      key: 'realtime_gaming',
      id: getProviderId('realtime_gaming'),
      icon: 'sp-37-3-up.webp',
      logo: 'Realtime.png',
      name: 'Realtime Gaming',
      isLive: false,
    },
    {
      key: 'red_rake',
      id: getProviderId('red_rake'),
      icon: 'sp-38-3-up.webp',
      logo: 'RedRake.png',
      name: 'Red Rake',
      isLive: false,
    },
    {
      key: 'red_tiger',
      id: getProviderId('red_tiger'),
      icon: 'sp-39-3-up.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: false,
    },
    {
      key: 'relax_gaming',
      id: getProviderId('relax_gaming'),
      icon: 'sp-40-3-up.webp',
      logo: 'RelaxGaming 2.png',
      name: 'Relax Gaming',
      isLive: false,
    },
    {
      key: 'revolver_gaming',
      id: getProviderId('revolver_gaming'),
      icon: 'sp-41-3-up.webp',
      logo: 'Revolver Gaming.png',
      name: 'Revolver Gaming',
      isLive: false,
    },
    {
      key: 'slotmill',
      id: getProviderId('slotmill'),
      icon: 'sp-42-3-up.webp',
      logo: 'slotmill-logo-min 2.png',
      name: 'Slotmill',
      isLive: false,
    },
    {
      key: 'slotopia',
      id: getProviderId('slotopia'),
      icon: 'sp-43-3-up.webp',
      logo: 'slotopia.png',
      name: 'Slotopia',
      isLive: false,
    },
    {
      key: 'thunderkick',
      id: getProviderId('thunderkick'),
      icon: 'sp-44-3-up.webp',
      logo: 'ThunderKick.png',
      name: 'Thunderkick',
      isLive: false,
    },
    {
      key: 'top_trend',
      id: getProviderId('top_trend'),
      icon: 'sp-45-3-up.webp',
      logo: 'TopTrend.png',
      name: 'Top Trend',
      isLive: false,
    },
    {
      key: 'tpg',
      id: getProviderId('tpg'),
      icon: 'sp-46-3-up.webp',
      logo: 'TPG.png',
      name: 'TPG',
      isLive: false,
    },
    {
      key: 'twain_sport',
      id: getProviderId('twain_sport'),
      icon: 'sp-47-3-up.webp',
      logo: 'Twain Sport.png',
      name: 'Twain Sport',
      isLive: false,
    },
    {
      key: 'voltent',
      id: getProviderId('voltent'),
      icon: 'sp-48-3-up.webp',
      logo: 'voltent_m 2.png',
      name: 'Voltent',
      isLive: false,
    },
    {
      key: 'yggdrasil',
      id: getProviderId('yggdrasil'),
      icon: 'sp-50-3-up.webp',
      logo: 'YGGRASIL.png',
      name: 'Yggdrasil',
      isLive: false,
    },
    {
      key: 'world_match',
      id: getProviderId('world_match'),
      icon: 'sp-49-3-up.webp',
      logo: 'WorldMatch.png',
      name: 'World Match',
      isLive: false,
    },
    {
      key: 'fat_panda',
      id: getProviderId('fat_panda'),
      icon: 'sp-62-3-up.webp',
      logo: 'Fatpanda.png',
      name: 'Fat Panda',
      isLive: false,
    },
    {
      key: 'fantasma',
      id: getProviderId('fantasma'),
      icon: 'sp-63-3-up.webp',
      logo: 'Fantasma.png',
      name: 'Fantasma',
      isLive: false,
    },
    {
      key: 'no_limit_city',
      id: getProviderId('no_limit_city'),
      icon: 'sp-29-3-up.webp',
      logo: 'Nolimit City.png',
      name: 'No Limit City',
      isLive: false,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-3-up.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: false,
    },
    {
      key: 'kiron',
      id: getProviderId('kiron'),
      icon: 'sp-25-3-up.webp',
      logo: 'Kiron.png',
      name: 'Kiron',
      isLive: false,
    },
    {
      key: 'leap_gaming',
      id: getProviderId('leap_gaming'),
      icon: 'sp-26-3-up.webp',
      logo: 'Leap.png',
      name: 'Leap Gaming',
      isLive: false,
    },
    {
      key: 'mobilots',
      id: getProviderId('mobilots'),
      icon: 'sp-27-3-up.webp',
      logo: 'Mobilots.png',
      name: 'Mobilots',
      isLive: false,
    },
    {
      key: 'kalamba',
      id: getProviderId('kalamba'),
      icon: 'sp-24-3-up.webp',
      logo: 'Kalamba.png',
      name: 'Kalamba',
      isLive: false,
    },
    {
      key: 'jdp_gaming',
      id: getProviderId('jdp_gaming'),
      icon: 'sp-22-3-up.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: false,
    },
    {
      key: 'jili_games',
      id: getProviderId('jili_games'),
      icon: 'sp-23-3-up.webp',
      logo: 'JiliGames.png',
      name: 'Jili Games',
      isLive: false,
    },
    {
      key: 'iron_dog',
      id: getProviderId('iron_dog'),
      icon: 'sp-21-3-up.webp',
      logo: 'IronDog.png',
      name: 'Iron Dog',
      isLive: false,
    },
    {
      key: 'hacksaw',
      id: getProviderId('hacksaw'),
      icon: 'sp-20-3-up.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: false,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-18-3-up.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: false,
    },
    {
      key: 'novomatic',
      id: getProviderId('novomatic'),
      icon: 'sp-30-3-up.webp',
      logo: 'novomatic.png',
      name: 'Novomatic',
      isLive: false,
    },
    {
      key: 'dragon_soft',
      id: getProviderId('dragon_soft'),
      icon: 'sp-17-3-up.webp',
      logo: 'DragonSoft.png',
      name: 'Dragon Soft',
      isLive: false,
    },
    {
      key: 'blueprint',
      id: getProviderId('blueprint'),
      icon: 'sp-15-3-up.webp',
      logo: 'Blueprint.png',
      name: 'Blueprint',
      isLive: false,
    },
    {
      key: 'bng',
      id: getProviderId('bng'),
      icon: 'sp-16-3-up.webp',
      logo: 'BNG.png',
      name: 'BNG',
      isLive: false,
    },
    {
      key: 'big_time_gaming_2',
      id: getProviderId('big_time_gaming_2'),
      icon: 'sp-14-3.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'creative_gaming',
      id: getProviderId('creative_gaming'),
      icon: 'sp-60-3-up.webp',
      logo: 'cg-3.png',
      name: 'Creative Gaming',
      isLive: false,
    },
    {
      key: 'live_22',
      id: getProviderId('live_22'),
      icon: 'sp-59-3-up.webp',
      logo: 'live22-3.png',
      name: 'Live 22',
      isLive: false,
    },
    {
      key: '7_mojos',
      id: getProviderId('7_mojos'),
      icon: 'sp-58-3-up.webp',
      logo: '7mojos-3.png',
      name: '7 Mojos',
      isLive: false,
    },
    {
      key: 'spinomenal',
      id: getProviderId('spinomenal'),
      icon: 'sp-57-3-up.webp',
      logo: 'spinomental-3.png',
      name: 'Spinomenal',
      isLive: false,
    },
    {
      key: 'booming_games',
      id: getProviderId('booming_games'),
      icon: 'sp-56-3-up.webp',
      logo: 'booming-game-3.png',
      name: 'Booming games',
      isLive: false,
    },
    {
      key: 'ask_me',
      id: getProviderId('ask_me'),
      icon: 'sp-55-3-up.webp',
      logo: 'askme-3.png',
      name: 'Ask me',
      isLive: false,
    },
    {
      key: 'advant_play',
      id: getProviderId('advant_play'),
      icon: 'sp-54-3-up.webp',
      logo: 'advant-play-3.png',
      name: 'Advant Play',
      isLive: false,
    },
    {
      key: 'yellow_bet',
      id: getProviderId('yellow_bet'),
      icon: 'sp-53-3-up.webp',
      logo: 'yellow-bet-3.png',
      name: 'Yellow bet',
      isLive: false,
    },
    {
      key: 'spade_game',
      id: getProviderId('spade_game'),
      icon: 'sp-52-3-up.webp',
      logo: 'spade-game-3.png',
      name: 'Spade Game',
      isLive: false,
    },
    {
      key: 'nlc',
      id: getProviderId('nlc'),
      icon: 'sp-1-3-New.webp',
      logo: 'nlc.png',
      name: 'NLC',
      isLive: false,
    },
    {
      key: 'kgames',
      id: getProviderId('kgames'),
      icon: 'sp-2-3-New.webp',
      logo: 'kgames.png',
      name: 'KGAMES',
      isLive: false,
    },
    {
      key: 'belatra_games',
      id: getProviderId('belatra_games'),
      icon: 'sp-3-3-New.webp',
      logo: 'belatra-games.png',
      name: 'BELATRA GAMES',
      isLive: false,
    },
    {
      key: 'bf_games',
      id: getProviderId('bf_games'),
      icon: 'sp-4-3-New.webp',
      logo: 'bf-games.png',
      name: 'BF GAMES',
      isLive: false,
    },
    {
      key: 'vibra',
      id: getProviderId('vibra'),
      icon: 'sp-5-3-New.webp',
      logo: 'vibra.png',
      name: 'Vibra',
      isLive: false,
    },
    {
      key: 'concept_gaming',
      id: getProviderId('concept_gaming'),
      icon: 'sp-6-3-New.webp',
      logo: 'concept-gaming.png',
      name: 'CONCEPT GAMING',
      isLive: false,
    },
    {
      key: 'egt',
      id: getProviderId('egt'),
      icon: 'sp-7-3-New.webp',
      logo: 'egp.png',
      name: 'EGP',
      isLive: false,
    },
    {
      key: 'igamefish_global',
      id: getProviderId('igamefish_global'),
      icon: 'sp-8-3-New.webp',
      logo: 'igamefish-global.png',
      name: 'IGAMEFISH GLOBAL',
      isLive: false,
    },
    {
      key: 'gmw',
      id: getProviderId('gmw'),
      icon: 'sp-9-3-New.webp',
      logo: 'gmw.png',
      name: 'GMW',
      isLive: false,
    },
    {
      key: 'ka_gaming',
      id: getProviderId('ka_gaming'),
      icon: 'sp-10-3-New.webp',
      logo: 'ka-gaming.png',
      name: 'KA Gaming',
      isLive: false,
    },
    {
      key: 'legal_casino',
      id: getProviderId('legal_casino'),
      icon: 'sp-11-3-New.webp',
      logo: 'legal-casino.png',
      name: 'legal casino',
      isLive: false,
    },
    {
      key: 'macaw_gaming',
      id: getProviderId('macaw_gaming'),
      icon: 'sp-12-3-New.webp',
      logo: 'macaw-gaming.png',
      name: 'MACAW GAMING',
      isLive: false,
    },
    {
      key: 'm_play',
      id: getProviderId('m_play'),
      icon: 'sp-13-3-New.webp',
      logo: 'm-play.png',
      name: 'm play',
      isLive: false,
    },
    {
      key: 'patagonia',
      id: getProviderId('patagonia'),
      icon: 'sp-14-3-New.webp',
      logo: 'patagonia.png',
      name: 'patagonia',
      isLive: false,
    },
    {
      key: 'wazdan',
      id: getProviderId('wazdan'),
      icon: 'sp-15-3-New.webp',
      logo: 'wazdan.png',
      name: 'Wazdan',
      isLive: false,
    },
  ];

  return (
    <div className="text-white [&_.bg-gradient-to-t]:hidden [&_.group]:rounded-xl [&_.group]:border-0 [&_.group]:bg-transparent [&_.group]:shadow-none">
      {/* Home-style Hero Banner (same as Home Page) */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        aria-label={t('hero_section')}
        style={{
          backgroundImage:
            ' url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-page-banner-3.webp)',
        }}
      >
        {/* Content */}
        <div className="container mx-auto flex w-full items-center pt-6 sm:pt-8 lg:pt-10">
          <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
            {/* Girl image (right on desktop) */}
            <div className="order-2 flex justify-center md:order-2 md:justify-end">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-banner-girl-3.webp"
                alt={t('hero_girl')}
                width={480}
                height={500}
                className="h-auto w-[400px] max-w-full object-contain sm:w-[400px] md:w-[400px] lg:w-[400px] xl:w-[550px]"
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 360px, (min-width: 640px) 280px, 220px"
                priority
              />
            </div>

            {/* Headline and Subheadline (left on desktop) */}
            <div className="order-1 text-center md:order-1 md:text-left">
              <h1
                className="bg-[#E8D25E] bg-clip-text !text-[40px] leading-tight font-semibold tracking-wide text-transparent uppercase lg:!text-[60px]"
                style={{
                  WebkitTextStroke: '0px transparent',
                  textStroke: '0px transparent',
                }}
              >
                {t('your_jackpot_journey_begins_here')}
              </h1>

              <p className="mt-4 bg-[#E8D25E] bg-clip-text text-[20px] font-semibold text-transparent sm:mt-6 sm:text-base md:text-lg lg:text-xl">
                {t('jackpot_dreams_start_here')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Header with gradient border */}
        <div className="mb-6 w-full">
          <div className="flex items-center gap-3 rounded-lg border border-[#E8D25E] px-3 py-2 md:px-4 md:py-3">
            <div className="flex w-full items-center gap-3 rounded-lg bg-black px-2 py-1">
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/new-games-3.png"
                alt="Slot Providers"
                width={50}
                height={50}
                className="object-contain"
              />
              <h3
                className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('slot_providers')}
              </h3>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {staticProviders.map((provider) => (
              <div
                key={provider.key}
                className="group relative w-full overflow-hidden rounded-xl border border-purple-500/20 bg-black/20 shadow-sm transition-all duration-300 hover:border-[#E8D25E] hover:shadow-[0_0_10px_0_#FC7E09_inset]"
              >
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
                  <div className="absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#6d6936c9] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                      className="rounded-md border-2 border-black px-5 py-2 text-sm font-semibold text-black shadow-md hover:brightness-110"
                      style={{
                        background: '#E8D25E',
                      }}
                    >
                      PLAY
                    </button>
                  </div>
                </div>
                {/* Provider Name - Bottom Right */}
                <div className="pointer-events-none absolute right-0 bottom-[0px]">
                  <div
                    className="max-w-[120px] min-w-[120px] truncate px-3 py-1 text-center text-[12px] font-semibold text-black uppercase md:max-w-[170px] md:min-w-[150px] md:text-[14px]"
                    style={{
                      borderRadius: '14px 0 6px 0',
                      background: '#E8D25E',
                    }}
                  >
                    {provider.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slot Bottom Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="hidden h-auto w-full object-cover md:block"
            sizes="100vw"
            priority={false}
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new-mob.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="block h-auto w-full object-cover md:hidden"
            sizes="100vw"
            priority={false}
          />

          {/* Text Overlay - Top centered on mobile, left aligned on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-12 md:items-center md:justify-start md:pt-0">
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
              .banner-text {
                font-family: var(--font-alatsi);
              }
            `}</style>
            <h1 className="banner-text bg-[#E8D25E] bg-clip-text px-4 text-center leading-tight font-semibold tracking-wide text-transparent uppercase md:px-16 md:text-left">
              <div className="text-center !text-[22px] md:text-left md:!text-[30px] lg:!text-[50px]">
                {t('diamonds_dollars')}
                <br />
                {t('and_destiny')}
              </div>
              <div className="mt-1 text-center !text-[20px] md:mt-2 md:text-left md:!text-[25px] lg:!text-[30px]">
                {t('spin_like_a_vip')}
              </div>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
