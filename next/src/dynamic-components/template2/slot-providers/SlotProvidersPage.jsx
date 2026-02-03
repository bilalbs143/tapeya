'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template2/components/LazyImage/LazyImage';
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
      icon: 'sp-28.webp',
      logo: 'bighit.png',
      name: 'The Bighit',
      isLive: true,
    },
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-50.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-51.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-52.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-53.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-54.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-55.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-42.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'pocket_soft_gaming',
      id: getProviderId('pocket_soft_gaming'),
      icon: 'sp-1.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: false,
    },
    {
      key: '1x2_gaming',
      id: getProviderId('1x2_gaming'),
      icon: 'sp-2.webp',
      logo: '1x2network.png',
      name: '1x2 Gaming',
      isLive: false,
    },
    {
      key: 'avatar_ux',
      id: getProviderId('avatar_ux'),
      icon: 'sp-3.webp',
      logo: 'Nolimit City.png',
      name: 'Avatar UX',
      isLive: false,
    },
    {
      key: 'bgaming',
      id: getProviderId('bgaming'),
      icon: 'sp-4.webp',
      logo: 'Novomatic.png',
      name: 'BGaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming',
      id: getProviderId('big_time_gaming'),
      icon: 'sp-5.webp',
      logo: 'Onetouch.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'penguin_king',
      id: getProviderId('penguin_king'),
      icon: 'sp-6.webp',
      logo: 'Penguin King.png',
      name: 'Penguin King',
      isLive: false,
    },
    {
      key: 'play_n_go_2',
      id: getProviderId('play_n_go_2'),
      icon: 'sp-7.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: false,
    },
    {
      key: 'playson',
      id: getProviderId('playson'),
      icon: 'sp-8.webp',
      logo: 'Playson-banner 2.png',
      name: 'Playson',
      isLive: false,
    },
    {
      key: 'playstar',
      id: getProviderId('playstar'),
      icon: 'sp-9.webp',
      logo: 'Playstar.png',
      name: 'Playstar',
      isLive: false,
    },
    {
      key: 'quickspin',
      id: getProviderId('quickspin'),
      icon: 'sp-10.webp',
      logo: 'quickspin-logo 2.png',
      name: 'Quickspin',
      isLive: false,
    },
    {
      key: 'push_gaming',
      id: getProviderId('push_gaming'),
      icon: 'sp-11.webp',
      logo: 'pushGaming.png',
      name: 'Push Gaming',
      isLive: false,
    },
    {
      key: 'realtime_gaming',
      id: getProviderId('realtime_gaming'),
      icon: 'sp-12.webp',
      logo: 'Realtime.png',
      name: 'Realtime Gaming',
      isLive: false,
    },
    {
      key: 'red_rake',
      id: getProviderId('red_rake'),
      icon: 'sp-13.webp',
      logo: 'RedRake.png',
      name: 'Red Rake',
      isLive: false,
    },
    {
      key: 'red_tiger',
      id: getProviderId('red_tiger'),
      icon: 'sp-14.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: false,
    },
    {
      key: 'relax_gaming',
      id: getProviderId('relax_gaming'),
      icon: 'sp-15.webp',
      logo: 'RelaxGaming 2.png',
      name: 'Relax Gaming',
      isLive: false,
    },
    {
      key: 'revolver_gaming',
      id: getProviderId('revolver_gaming'),
      icon: 'sp-16.webp',
      logo: 'Revolver Gaming.png',
      name: 'Revolver Gaming',
      isLive: false,
    },
    {
      key: 'slotmill',
      id: getProviderId('slotmill'),
      icon: 'sp-17.webp',
      logo: 'slotmill-logo-min 2.png',
      name: 'Slotmill',
      isLive: false,
    },
    {
      key: 'slotopia',
      id: getProviderId('slotopia'),
      icon: 'sp-18.webp',
      logo: 'slotopia.png',
      name: 'Slotopia',
      isLive: false,
    },
    {
      key: 'thunderkick',
      id: getProviderId('thunderkick'),
      icon: 'sp-19.webp',
      logo: 'ThunderKick.png',
      name: 'Thunderkick',
      isLive: false,
    },
    {
      key: 'top_trend',
      id: getProviderId('top_trend'),
      icon: 'sp-20.webp',
      logo: 'TopTrend.png',
      name: 'Top Trend',
      isLive: false,
    },
    {
      key: 'tpg',
      id: getProviderId('tpg'),
      icon: 'sp-21.webp',
      logo: 'TPG.png',
      name: 'TPG',
      isLive: false,
    },
    {
      key: 'twain_sport',
      id: getProviderId('twain_sport'),
      icon: 'sp-22.webp',
      logo: 'Twain Sport.png',
      name: 'Twain Sport',
      isLive: false,
    },
    {
      key: 'voltent',
      id: getProviderId('voltent'),
      icon: 'sp-23.webp',
      logo: 'voltent_m 2.png',
      name: 'Voltent',
      isLive: false,
    },
    {
      key: 'yggdrasil',
      id: getProviderId('yggdrasil'),
      icon: 'sp-24.webp',
      logo: 'YGGRASIL.png',
      name: 'Yggdrasil',
      isLive: false,
    },
    {
      key: 'world_match',
      id: getProviderId('world_match'),
      icon: 'sp-25.webp',
      logo: 'WorldMatch.png',
      name: 'World Match',
      isLive: false,
    },
    {
      key: 'fat_panda',
      id: getProviderId('fat_panda'),
      icon: 'sp-26.webp',
      logo: 'Fatpanda.png',
      name: 'Fat Panda',
      isLive: false,
    },
    {
      key: 'fantasma',
      id: getProviderId('fantasma'),
      icon: 'sp-27.webp',
      logo: 'Fantasma.png',
      name: 'Fantasma',
      isLive: false,
    },
    {
      key: 'no_limit_city',
      id: getProviderId('no_limit_city'),
      icon: 'sp-29.webp',
      logo: 'Nolimit City.png',
      name: 'No Limit City',
      isLive: false,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-30.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: false,
    },
    {
      key: 'kiron',
      id: getProviderId('kiron'),
      icon: 'sp-31.webp',
      logo: 'Kiron.png',
      name: 'Kiron',
      isLive: false,
    },
    {
      key: 'leap_gaming',
      id: getProviderId('leap_gaming'),
      icon: 'sp-32.webp',
      logo: 'Leap.png',
      name: 'Leap Gaming',
      isLive: false,
    },
    {
      key: 'mobilots',
      id: getProviderId('mobilots'),
      icon: 'sp-33.webp',
      logo: 'Mobilots.png',
      name: 'Mobilots',
      isLive: false,
    },
    {
      key: 'kalamba',
      id: getProviderId('kalamba'),
      icon: 'sp-34.webp',
      logo: 'Kalamba.png',
      name: 'Kalamba',
      isLive: false,
    },
    {
      key: 'jdp_gaming',
      id: getProviderId('jdp_gaming'),
      icon: 'sp-35.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: false,
    },
    {
      key: 'jili_games',
      id: getProviderId('jili_games'),
      icon: 'sp-36.webp',
      logo: 'JiliGames.png',
      name: 'Jili Games',
      isLive: false,
    },
    {
      key: 'iron_dog',
      id: getProviderId('iron_dog'),
      icon: 'sp-37.webp',
      logo: 'IronDog.png',
      name: 'Iron Dog',
      isLive: false,
    },
    {
      key: 'hacksaw',
      id: getProviderId('hacksaw'),
      icon: 'sp-38.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: false,
    },
    {
      key: 'habanero_2',
      id: getProviderId('habanero_2'),
      icon: 'sp-39.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: false,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-40.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: false,
    },
    {
      key: 'genesis',
      id: getProviderId('genesis'),
      icon: 'sp-41.webp',
      logo: 'Genesis.png',
      name: 'Genesis',
      isLive: false,
    },
    {
      key: 'dragon_soft',
      id: getProviderId('dragon_soft'),
      icon: 'sp-43.webp',
      logo: 'DragonSoft.png',
      name: 'Dragon Soft',
      isLive: false,
    },
    {
      key: 'blueprint',
      id: getProviderId('blueprint'),
      icon: 'sp-44.webp',
      logo: 'Blueprint.png',
      name: 'Blueprint',
      isLive: false,
    },
    {
      key: 'bng',
      id: getProviderId('bng'),
      icon: 'sp-45.webp',
      logo: 'BNG.png',
      name: 'BNG',
      isLive: false,
    },
    {
      key: 'bgaming_2',
      id: getProviderId('bgaming_2'),
      icon: 'sp-46.webp',
      logo: 'Bgaming.png',
      name: 'Bgaming',
      isLive: false,
    },
    {
      key: 'big_time_gaming_2',
      id: getProviderId('big_time_gaming_2'),
      icon: 'sp-47.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: false,
    },
    {
      key: 'avatar',
      id: getProviderId('avatar'),
      icon: 'sp-48.webp',
      logo: 'Avatar.png',
      name: 'Avatar',
      isLive: false,
    },
  ];

  return (
    <div className="text-white [&_.bg-gradient-to-t]:hidden [&_.group]:rounded-xl [&_.group]:border-0 [&_.group]:bg-transparent [&_.group]:shadow-none">
      {/* Home-style Hero Banner (same as Live Casino) */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        aria-label={t('hero_section')}
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0, 0, 0, 0.19) 50%, rgba(0, 0, 0, 0.77) 100%), url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-slider.webp)',
        }}
      >
        <div className="container mx-auto flex w-full items-center pt-6 sm:pt-8 lg:pt-10">
          <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
            {/* Right: Girl image (desktop) - Second on mobile, Right on desktop */}
            <div className="order-2 flex justify-center md:order-2 md:justify-end">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-girl.webp"
                alt={t('hero_girl')}
                width={480}
                height={500}
                className="h-auto w-[400px] max-w-full object-contain sm:w-[400px] md:w-[400px] lg:w-[500px] xl:w-[550px]"
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 360px, (min-width: 640px) 280px, 220px"
                priority
              />
            </div>

            {/* Left: Headline and CTA (desktop) - First on mobile, Left on desktop */}
            <div className="order-1 text-center md:order-1">
              <h1
                className="!text-[30px] leading-tight font-normal tracking-wide text-white uppercase lg:!text-[50px]"
                style={{ fontFamily: 'var(--font-airstrike)' }}
              >
                JACKPOT
                <br className="hidden sm:block" />
                AWAITS-ONE
                <br className="hidden sm:block" />
                PULL AWAY
              </h1>

              <div className="mt-4 sm:mt-6">
                <button
                  type="button"
                  className="inline-block px-6 py-2 text-sm font-semibold tracking-[0.5em] text-white uppercase shadow-md sm:px-10 sm:py-3 sm:text-base"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #1556439e 0%, #0e947369 100%)',
                    clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)',
                  }}
                >
                  PULL THE LEVER. TRIGGER THE LEGEND.
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src={`${baseUrl}/backgrounds/lines-pattern.svg`}
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-2 sm:mb-8 sm:gap-3">
            <h2 className="text-lg leading-tight font-extrabold text-white sm:text-xl md:text-2xl">
              {t('slot_providers')}
            </h2>
          </div>

          {/* 5-column grid on large screens */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {staticProviders.map((provider) => (
              <div
                key={provider.key}
                className="group relative w-full overflow-hidden rounded-xl border border-purple-500/20 bg-black/20 shadow-sm transition-all duration-300 hover:border-[#51A2FF] hover:shadow-[0_0_10px_0_#FC7E09_inset]"
              >
                <div className="relative h-[120px] w-full bg-[#0B0F2A] sm:h-[150px] md:h-[180px] lg:h-[170px] xl:h-[180px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LazyImage
                      src={`${baseUrl}/icons/${provider.icon}`}
                      alt={provider.name}
                      fill
                      sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                      className="object-cover object-center transition-transform duration-300"
                      quality={85}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
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
                      className="rounded-md bg-[#6AA5FF] px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
                    >
                      PLAY
                    </button>
                  </div>
                </div>
                <div className="pointer-events-none absolute bottom-3 left-1/2 w-[92%] -translate-x-1/2 transform text-center transition-opacity duration-300 group-hover:opacity-0">
                  <div
                    className="text-[12px] leading-tight font-normal text-white uppercase sm:text-sm md:text-base"
                    style={{
                      fontFamily: 'var(--font-airstrike)',
                      textShadow:
                        '0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
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
    </div>
  );
}
