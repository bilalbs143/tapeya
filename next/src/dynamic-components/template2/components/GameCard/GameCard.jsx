'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template2/components/LazyImage/LazyImage';
import { formatProviderName } from '@/helpers/stringUtils';
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
    nameClassName = '',
    playButtonClassName = '',
    playTextClassName = '',
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
      return () => {};
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

    const isGameLaunching = isLaunching(game.id);

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

    const handlePlayButtonClick = useCallback(
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleGameLaunch(game.id);
      },
      [handleGameLaunch, game.id],
    );

    return (
      <div
        className={`group ${className} cursor-pointer`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`relative overflow-hidden rounded-xl border-2 border-transparent bg-[#0B0F2A] transition-[box-shadow,border-color] duration-300 group-hover:border-[#51A2FF] group-hover:shadow-[inset_0_0_14px_2px_#51A2FF] ${imageClassName}`}
        >
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
            className={`object-cover object-center transition-all duration-300 sm:group-hover:blur-[4px] ${imageClassName}`}
          />

          {/* Play Button Overlay */}
          {showPlayButton && (
            <div className="bg-opacity-0 sm:group-hover:bg-opacity-50 absolute inset-0 hidden items-center justify-center transition-all duration-300 sm:flex sm:hover:bg-[#141943]/50">
              <div className="flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 sm:gap-3 sm:group-hover:opacity-100">
                <button
                  onClick={handlePlayButtonClick}
                  disabled={isGameLaunching}
                  className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#51A2FF] transition-colors hover:bg-[#51A2FF] disabled:opacity-50 sm:h-16 sm:w-16 ${playButtonClassName}`}
                >
                  {isGameLaunching ? (
                    <CommonLoader
                      size="sm"
                      className="text-white"
                      border="border-[#51A2FF]"
                      centered={false}
                    />
                  ) : (
                    <svg
                      className="h-4 w-4 text-white sm:h-6 sm:w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`px-2 text-center text-xs font-semibold text-white sm:text-sm ${playTextClassName}`}
                >
                  {isGameLaunching
                    ? t('launching')
                    : formatProviderName(game.provider)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 text-center">
          <p
            className={`truncate text-xs font-medium text-white sm:text-sm ${nameClassName}`}
          >
            {game.name}
          </p>
        </div>
      </div>
    );
  },
);

GameCard.displayName = 'GameCard';

export default GameCard;
