'use client';

import Image from 'next/image';
import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template10/components/LazyImage/LazyImage';
import {
  formatAmountInMillions,
  formatCurrency,
  formatNumber,
  formatPoints,
} from '@/helpers/formatting';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchRealtimeWinners } from '@/website/websiteAction';

const RightSidebar = memo(function RightSidebar() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();
  const { realtimeWinnersData } = useSelector((state) => state.website);
  const { user } = useSelector((state) => state.auth);

  // Extract wallet information from user data
  const holdingMoney = user?.wallet?.holding_money || 0;
  const points = user?.wallet?.points || 0;
  const couponPoints = user?.wallet?.coupon_points || 0;

  useEffect(() => {
    dispatch(fetchRealtimeWinners());
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

  return (
    <aside
      className="template10-right-sidebar m-4 hidden w-64 flex-shrink-0 overflow-hidden rounded-[5px] border lg:block lg:w-64 xl:w-64"
      style={{
        border: '1px solid rgba(36, 106, 115, 0.30)',
        background: 'linear-gradient(180deg, #00181B 0%, #131515 65.75%)',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <div className="flex flex-col p-3">
        {/* Top Image with Wallet Info */}
        <div className="relative mb-4 w-full">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/game-wallet-10.webp"
            alt="Game Wallet"
            width={1000}
            height={1000}
            className="h-auto w-full"
            unoptimized
          />

          {/* Wallet Information Overlay */}
          <div className="absolute bottom-0 left-0 flex w-full flex-col gap-[25px] p-4">
            {/* Wallet Section */}
            <div>
              <div
                className="mb-1 text-sm font-medium"
                style={{ color: '#3DCCC7' }}
              >
                Wallet
              </div>
              <div
                className="max-w-fit pb-2 text-xl font-bold text-white"
                style={{ borderBottom: '1px solid #3DCCC7' }}
              >
                {formatCurrency(holdingMoney)}
              </div>
            </div>

            {/* Points Section */}
            <div>
              <div
                className="mb-1 text-sm font-medium"
                style={{ color: '#3DCCC7' }}
              >
                Points
              </div>
              <div
                className="max-w-fit pb-2 text-xl font-bold text-white"
                style={{ borderBottom: '1px solid #3DCCC7' }}
              >
                {formatPoints(points)}
              </div>
            </div>

            {/* Coupons Section */}
            <div>
              <div
                className="mb-1 text-sm font-medium"
                style={{ color: '#3DCCC7' }}
              >
                Coupons
              </div>
              <div className="text-xl font-bold text-white">
                {formatNumber(couponPoints)}C
              </div>
            </div>
          </div>
        </div>

        {/* Live Winners Container */}
        <div
          className="scrollbar-live-winners flex flex-col rounded-[3px] p-3"
          style={{
            backgroundColor: '#246A734D',
          }}
        >
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-normal text-[#3DCCC7]">
              {t('live_winners')}
            </h2>
          </div>

          {/* Live Winners List */}
          <div
            className="scrollbar-live-winners flex-1 space-y-3 overflow-y-auto pr-2"
            style={{
              maxHeight: 'calc(68vh - 100px)',
            }}
          >
            {displayWinners.slice(0, 10).map((winner, index) => (
              <div key={winner.id || index} className="flex items-start gap-3">
                {/* Game Thumbnail */}
                <div
                  className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[3px] border bg-gray-700"
                  style={{ borderColor: 'rgba(219, 180, 44, 0.30)' }}
                >
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
                    <div
                      className="inline-flex items-center gap-1 rounded border px-2 py-1"
                      style={{
                        borderColor: 'rgba(36, 106, 115, 0.30)',
                        backgroundColor: '#131515',
                      }}
                    >
                      <LazyImage
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/coin-10.svg"
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
              </div>
            ))}
          </div>
        </div>

        {/* Download APK Banner */}
        <div className="mt-6 overflow-hidden">
          <a
            href="https://thestaticfile.com/uploads/user10.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block"
          >
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/download-apk-10.webp"
              alt="Download APK"
              width={240}
              height={80}
              className="h-auto w-full"
              unoptimized
            />
            <div className="absolute top-6 right-0 left-0">
              <div className="text-center text-[20px] leading-tight font-bold text-white uppercase">
                {t('download_apk')}
              </div>
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
});

export default RightSidebar;
