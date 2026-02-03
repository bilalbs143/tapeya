'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template4/components/LazyImage/LazyImage';
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
      key: 'thebighit',
      id: getProviderId('thebighit'),
      icon: 'sp-81-4.webp',
      logo: 'bighit.png',
      name: 'The Bighit',
      isLive: true,
    },
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-4.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-4.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-4.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-4.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-18-4-1.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-4.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-4.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'pocket_soft_gaming',
      id: getProviderId('pocket_soft_gaming'),
      icon: 'sp-10-4.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: false,
    },
    {
      key: '1x2_gaming',
      id: getProviderId('1x2_gaming'),
      icon: 'sp-11-4.webp',
      logo: '1x2network.png',
      name: '1x2 Gaming',
      isLive: false,
    },
    {
      key: 'avatar_ux',
      id: getProviderId('avatar_ux'),
      icon: 'sp-51-4.webp',
      logo: 'avatar-ux.png',
      name: 'Avatar UX',
      isLive: false,
    },
    {
      key: 'bgaming',
      id: getProviderId('bgaming'),
      icon: 'sp-12-4.webp',
      logo: 'Bgaming.png',
      name: 'BGaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming',
      id: getProviderId('big_time_gaming'),
      icon: 'sp-30-4.webp',
      logo: 'Onetouch.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'penguin_king',
      id: getProviderId('penguin_king'),
      icon: 'sp-31-4.webp',
      logo: 'Penguin King.png',
      name: 'Penguin King',
      isLive: false,
    },
    {
      key: 'gameart',
      id: getProviderId('gameart'),
      icon: 'sp-50-4.webp',
      logo: 'game-art.png',
      name: 'GameArt',
      isLive: false,
    },
    {
      key: 'playson',
      id: getProviderId('playson'),
      icon: 'sp-32-4.webp',
      logo: 'Playson-banner 2.png',
      name: 'Playson',
      isLive: false,
    },
    {
      key: 'playstar',
      id: getProviderId('playstar'),
      icon: 'sp-80-4.webp',
      logo: 'Playstar.png',
      name: 'Playstar',
      isLive: false,
    },
    {
      key: 'quickspin',
      id: getProviderId('quickspin'),
      icon: 'sp-35-4.webp',
      logo: 'quickspin-logo 2.png',
      name: 'Quickspin',
      isLive: false,
    },
    {
      key: 'push_gaming',
      id: getProviderId('push_gaming'),
      icon: 'sp-53-5.webp',
      logo: 'pushGaming.png',
      name: 'Push Gaming',
      isLive: false,
    },
    {
      key: 'realtime_gaming',
      id: getProviderId('realtime_gaming'),
      icon: 'sp-33-4.webp',
      logo: 'Realtime.png',
      name: 'Realtime Gaming',
      isLive: false,
    },
    {
      key: 'red_rake',
      id: getProviderId('red_rake'),
      icon: 'sp-34.webp',
      logo: 'RedRake.png',
      name: 'Red Rake',
      isLive: false,
    },
    {
      key: 'red_tiger',
      id: getProviderId('red_tiger'),
      icon: 'sp-36-4.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: false,
    },
    {
      key: 'relax_gaming',
      id: getProviderId('relax_gaming'),
      icon: 'sp-37-4.webp',
      logo: 'RelaxGaming 2.png',
      name: 'Relax Gaming',
      isLive: false,
    },
    {
      key: 'revolver_gaming',
      id: getProviderId('revolver_gaming'),
      icon: 'sp-38-4.webp',
      logo: 'Revolver Gaming.png',
      name: 'Revolver Gaming',
      isLive: false,
    },
    {
      key: 'slotmill',
      id: getProviderId('slotmill'),
      icon: 'sp-39-4.webp',
      logo: 'slotmill-logo-min 2.png',
      name: 'Slotmill',
      isLive: false,
    },
    {
      key: 'slotopia',
      id: getProviderId('slotopia'),
      icon: 'sp-40-4.webp',
      logo: 'slotopia.png',
      name: 'Slotopia',
      isLive: false,
    },
    {
      key: 'thunderkick',
      id: getProviderId('thunderkick'),
      icon: 'sp-41-4.webp',
      logo: 'ThunderKick.png',
      name: 'Thunderkick',
      isLive: false,
    },
    {
      key: 'top_trend',
      id: getProviderId('top_trend'),
      icon: 'sp-42-5.webp',
      logo: 'TopTrend.png',
      name: 'Top Trend',
      isLive: false,
    },
    {
      key: 'tpg',
      id: getProviderId('tpg'),
      icon: 'sp-43-4.webp',
      logo: 'TPG.png',
      name: 'TPG',
      isLive: false,
    },
    {
      key: 'twain_sport',
      id: getProviderId('twain_sport'),
      icon: 'sp-45-4.webp',
      logo: 'Twain Sport.png',
      name: 'Twain Sport',
      isLive: false,
    },
    {
      key: 'voltent',
      id: getProviderId('voltent'),
      icon: 'sp-44-4.webp',
      logo: 'voltent_m 2.png',
      name: 'Voltent',
      isLive: false,
    },
    {
      key: 'yggdrasil',
      id: getProviderId('yggdrasil'),
      icon: 'sp-47-4.webp',
      logo: 'YGGRASIL.png',
      name: 'Yggdrasil',
      isLive: false,
    },
    {
      key: 'world_match',
      id: getProviderId('world_match'),
      icon: 'sp-46-4.webp',
      logo: 'WorldMatch.png',
      name: 'World Match',
      isLive: false,
    },
    {
      key: 'fat_panda',
      id: getProviderId('fat_panda'),
      icon: 'sp-48-4.webp',
      logo: 'Fatpanda.png',
      name: 'Fat Panda',
      isLive: false,
    },
    {
      key: 'fantasma',
      id: getProviderId('fantasma'),
      icon: 'sp-49-4.webp',
      logo: 'Fantasma.png',
      name: 'Fantasma',
      isLive: false,
    },
    {
      key: 'no_limit_city',
      id: getProviderId('no_limit_city'),
      icon: 'sp-28-4.webp',
      logo: 'Nolimit City.png',
      name: 'No Limit City',
      isLive: false,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-27-4.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: false,
    },
    {
      key: 'kiron',
      id: getProviderId('kiron'),
      icon: 'sp-24-4.webp',
      logo: 'Kiron.png',
      name: 'Kiron',
      isLive: false,
    },
    {
      key: 'leap_gaming',
      id: getProviderId('leap_gaming'),
      icon: 'sp-25-4.webp',
      logo: 'Leap.png',
      name: 'Leap Gaming',
      isLive: false,
    },
    {
      key: 'mobilots',
      id: getProviderId('mobilots'),
      icon: 'sp-26-4.webp',
      logo: 'Mobilots.png',
      name: 'Mobilots',
      isLive: false,
    },
    {
      key: 'kalamba',
      id: getProviderId('kalamba'),
      icon: 'sp-23-4.webp',
      logo: 'Kalamba.png',
      name: 'Kalamba',
      isLive: false,
    },
    {
      key: 'jdp_gaming',
      id: getProviderId('jdp_gaming'),
      icon: 'sp-21-4.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: false,
    },
    {
      key: 'jili_games',
      id: getProviderId('jili_games'),
      icon: 'sp-22-4.webp',
      logo: 'JiliGames.png',
      name: 'Jili Games',
      isLive: false,
    },
    {
      key: 'iron_dog',
      id: getProviderId('iron_dog'),
      icon: 'sp-20-4.webp',
      logo: 'IronDog.png',
      name: 'Iron Dog',
      isLive: false,
    },
    {
      key: 'hacksaw',
      id: getProviderId('hacksaw'),
      icon: 'sp-60-4.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: false,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-61-4.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: false,
    },
    {
      key: 'novomatic',
      id: getProviderId('novomatic'),
      icon: 'sp-29-4.webp',
      logo: 'novomatic.png',
      name: 'Novomatic',
      isLive: false,
    },
    {
      key: 'dragon_soft',
      id: getProviderId('dragon_soft'),
      icon: 'sp-16-4.webp',
      logo: 'DragonSoft.png',
      name: 'Dragon Soft',
      isLive: false,
    },
    {
      key: 'blueprint',
      id: getProviderId('blueprint'),
      icon: 'sp-14-4.webp',
      logo: 'Blueprint.png',
      name: 'Blueprint',
      isLive: false,
    },
    {
      key: 'bng',
      id: getProviderId('bng'),
      icon: 'sp-15-4.webp',
      logo: 'BNG.png',
      name: 'BNG',
      isLive: false,
    },
    {
      key: 'big_time_gaming_2',
      id: getProviderId('big_time_gaming_2'),
      icon: 'sp-13-4.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'creative_gaming',
      id: getProviderId('creative_gaming'),
      icon: 'sp-71-4.webp',
      logo: 'cg-3.png',
      name: 'Creative Gaming',
      isLive: false,
    },
    {
      key: 'live_22',
      id: getProviderId('live_22'),
      icon: 'sp-70-4.webp',
      logo: 'live22-3.png',
      name: 'Live 22',
      isLive: false,
    },
    {
      key: '7_mojos',
      id: getProviderId('7_mojos'),
      icon: 'sp-69-4.webp',
      logo: '7mojos-3.png',
      name: '7 Mojos',
      isLive: false,
    },
    {
      key: 'spinomenal',
      id: getProviderId('spinomenal'),
      icon: 'sp-68-4.webp',
      logo: 'spinomental-3.png',
      name: 'Spinomenal',
      isLive: false,
    },
    {
      key: 'booming_games',
      id: getProviderId('booming_games'),
      icon: 'sp-67-4.webp',
      logo: 'booming-game-3.png',
      name: 'Booming games',
      isLive: false,
    },
    {
      key: 'ask_me',
      id: getProviderId('ask_me'),
      icon: 'sp-66-4.webp',
      logo: 'askme-3.png',
      name: 'Ask me',
      isLive: false,
    },
    {
      key: 'advant_play',
      id: getProviderId('advant_play'),
      icon: 'sp-65-4.webp',
      logo: 'advant-play-3.png',
      name: 'Advant Play',
      isLive: false,
    },
    {
      key: 'yellow_bet',
      id: getProviderId('yellow_bet'),
      icon: 'sp-64-4.webp',
      logo: 'yellow-bet-3.png',
      name: 'Yellow bet',
      isLive: false,
    },
    {
      key: 'spade_game',
      id: getProviderId('spade_game'),
      icon: 'sp-63-4.webp',
      logo: 'spade-game-3.png',
      name: 'Spade Game',
      isLive: false,
    },
  ];

  return (
    <div className="text-white [&_.bg-gradient-to-t]:hidden [&_.group]:rounded-xl [&_.group]:border-0 [&_.group]:bg-transparent [&_.group]:shadow-none">
      {/* Slot Providers Hero Banner - Same structure as Home Page */}
      <section
        className="relative mx-auto w-full overflow-hidden px-2 md:px-6"
        aria-label={t('hero_section')}
      >
        {/* Desktop Background Image - Hidden on mobile */}
        <div className="relative hidden w-full md:block">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-4.webp"
            alt="Slot Providers Background"
            width={1920}
            height={400}
            className="h-auto w-full object-contain"
            priority
          />

          {/* Desktop Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-start">
            <div className="container mx-auto px-4">
              <div className="w-full max-w-2xl">
                {/* Headline and Subheadline (left aligned) */}
                <div className="text-left">
                  <h1
                    className="!text-[30px] leading-tight font-semibold tracking-wide text-white uppercase lg:!text-[55px]"
                    style={{
                      fontFamily: 'var(--font-alatsi)',
                      WebkitTextStroke: '0px transparent',
                      textStroke: '0px transparent',
                    }}
                  >
                    {t('vegas_thrills')}
                    <br />
                    {t('one_spin_away')}
                  </h1>
                  <div className="flex items-center justify-start gap-2 sm:mt-6">
                    {/* Diamond Icon */}
                    <div className="flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
                      <Image
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                        alt={t('hero_girl')}
                        width={480}
                        height={500}
                        className="h-auto"
                        priority
                      />
                    </div>
                    <p
                      className="text-[20px] font-semibold text-transparent text-white sm:text-base md:text-lg lg:text-xl"
                      style={{ fontFamily: 'var(--font-alatsi)' }}
                    >
                      {t('jackpot_dreams_start_here')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Background Image - Only visible on mobile */}
        <div className="relative block w-full md:hidden">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-4-mob.webp"
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
                  <h1
                    className="!text-[24px] leading-tight font-semibold tracking-wide text-transparent text-white uppercase"
                    style={{
                      fontFamily: 'var(--font-alatsi)',
                      WebkitTextStroke: '0px transparent',
                      textStroke: '0px transparent',
                    }}
                  >
                    {t('vegas_thrills')}
                    <br />
                    {t('one_spin_away')}
                  </h1>

                  <p
                    className="mt-4 text-sm font-semibold text-transparent text-white sm:text-base"
                    style={{ fontFamily: 'var(--font-alatsi)' }}
                  >
                    {t('jackpot_dreams_start_here')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Header - match slot detail header style */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between gap-3 px-0 py-0">
            <div className="flex flex-1 items-center gap-3 pl-0">
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                alt="Slot Providers"
                width={40}
                height={40}
                className="object-contain"
              />
              <h3
                className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('slot_providers')}
              </h3>
              {/* Responsive divider line to the right of title */}
              <div className="mx-2 h-[2px] flex-1 bg-[#5AB25A]" />
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
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#55BC55B3] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                      className="rounded-[45px] border-2 border-black bg-[black] px-10 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
                    >
                      PLAY
                    </button>
                  </div>
                </div>
                {/* Provider Name - Bottom Center */}
                <div className="pointer-events-none absolute bottom-[-4px] left-1/2 -translate-x-1/2 transform">
                  <div className="max-w-[120px] min-w-[120px] px-3 py-1 text-center text-[12px] font-bold text-white uppercase md:max-w-[170px] md:min-w-[230px] md:text-[20px]">
                    {provider.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slot Bottom Banner */}
      <div className="container mx-auto px-2 py-8 sm:px-4">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-4.webp"
            alt={t('home_page_banner')}
            className="hidden h-auto w-full object-cover md:block"
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-4.webp"
            alt={t('home_page_banner')}
            className="block h-auto w-full object-cover md:hidden"
          />

          {/* Text Overlay - Top center on mobile, right side on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-4 pr-0 md:items-center md:justify-end md:pt-0 md:pr-16">
            <div className="text-center font-['Montserrat']">
              {/* LUCK IS JUST A SPIN AWAY */}
              <div className="mb-2 text-[22px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[30px] lg:text-[50px]">
                {t('luck_is_just_a_spin_away')}
              </div>

              {/* TRY YOUR LUCK NOW with SVG wrapper */}
              <div className="relative mb-2">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1033"
                    height="151"
                    viewBox="0 0 1033 151"
                    fill="none"
                    className="h-12 w-full md:h-16 lg:h-20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M76.5 0H998.5L957 151H34.5L76.5 0Z"
                      fill="url(#paint0_linear_388_512)"
                      fillOpacity="0.7"
                    />
                    <path d="M44 0H69.5L27.2614 151H0L44 0Z" fill="#5AB25A" />
                    <path
                      d="M1007.5 0H1033L990.761 151H963.5L1007.5 0Z"
                      fill="#5AB25A"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_388_512"
                        x1="-35.6091"
                        y1="-6.86363"
                        x2="13.8558"
                        y2="326.752"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#5AB25A" />
                        <stop offset="0.433806" stopColor="#55BC55" />
                        <stop offset="0.898108" stopColor="#139113" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* TRY YOUR LUCK NOW text - centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[25px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[35px] lg:text-[50px]">
                      {t('try_your_luck_now')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Try Now */}
              <div className="text-center text-[14px] font-normal tracking-[8px] text-white md:text-[16px] lg:text-[18px]">
                {t('try_now')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
