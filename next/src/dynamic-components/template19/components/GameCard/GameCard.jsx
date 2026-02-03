'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import LazyImage from '@/dynamic-components/template19/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';

const GameCard = React.memo(
  ({
    game,
    onPlayClick,
    showPlayButton = true,
    className = '',
    imageClassName = '',
  }) => {
    const dispatch = useDispatch();
    const { t } = useTranslations();
    const { handlePlayGame, isLaunching } = useGameLaunch();
    const { isMobilePlatform } = useMobilePlatform();

    const [isSmallScreen, setIsSmallScreen] = useState(false);
    useEffect(() => {
      const mq =
        typeof window !== 'undefined'
          ? window.matchMedia('(max-width: 767px)')
          : null;
      const update = () => setIsSmallScreen(Boolean(mq && mq.matches));
      update();
      if (mq && typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
      }
      return () => { };
    }, []);

    // Handle game launch with custom callback
    const handleGameLaunch = useCallback(
      (gameId) => {
        handlePlayGame(gameId, (gameData) => {
          if (onPlayClick) {
            onPlayClick(game, gameData);
          }
        });
      },
      [handlePlayGame, game, onPlayClick],
    );

    // Handle opening launch game modal
    const handleOpenGameModal = useCallback(() => {
      if (isMobilePlatform || isSmallScreen) {
        dispatch(setSelectedGame(game));
        dispatch(openModal('launchGame'));
      }
    }, [dispatch, game, isMobilePlatform, isSmallScreen]);

    const handleCardClick = useCallback(() => {
      if (isMobilePlatform || isSmallScreen) {
        handleOpenGameModal();
      } else {
        handleGameLaunch(game.id);
      }
    }, [
      isMobilePlatform,
      isSmallScreen,
      handleOpenGameModal,
      handleGameLaunch,
      game.id,
    ]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isMobilePlatform || isSmallScreen) {
            handleOpenGameModal();
          } else {
            handleGameLaunch(game.id);
          }
        }
      },
      [
        isMobilePlatform,
        isSmallScreen,
        handleOpenGameModal,
        handleGameLaunch,
        game.id,
      ],
    );

    return (
      <div
        className={`group ${className} flex flex-col gap-2 relative cursor-pointer transition-all duration-300 hover:brightness-110`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Top: Image Card */}
        <div className={`relative w-full ${imageClassName || 'h-[165px] sm:h-[190px]'} overflow-hidden rounded-[10px] border border-[#06D6A04D] bg-[#121212]`}>
          <LazyImage
            src={
              game.image_url ||
              game.image ||
              game.thumbnail ||
              '/images/placeholders/slot.png'
            }
            alt={game.name}
            fill
            sizes="(max-width: 640px) 150px, (max-width: 1024px) 230px, 270px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover Overlay with Centered Play Button */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0F50454D] opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06D6A0] shadow-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="black"
                className="ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom: Name and Play Button Bar */}
        <div
          className="relative flex w-full items-center overflow-hidden"
          style={{
            border: '1px solid rgba(6, 214, 160, 0.3)',
            backgroundColor: 'rgba(20, 33, 61, 0.5)',
            borderRadius: '8px',
          }}
        >
          {/* Name Section */}
          <div className="flex-1 px-3 py-2 md:py-3 lg:pr-10">
            <span
              className="block truncate text-[12px] font-bold text-white uppercase md:text-[14px]"
              style={{ fontFamily: 'var(--font-king-town)' }}
            >
              {game.name?.split(/[:\-\(]/)[0]?.trim()}
            </span>
          </div>

          {/* Slanted Play Button Container */}
          {showPlayButton && (
            <div
              className="absolute top-0 right-0 flex h-full w-[40px] items-center justify-center bg-[#06D6A0] md:w-[48px]"
              style={{
                clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="black"
                className="ml-1.5"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  },
);

GameCard.displayName = 'GameCard';

export default GameCard;
