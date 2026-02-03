'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
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
        className={`${className} cursor-pointer`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className="game-card-simple group/card rounded-lg border border-[#20C5FE] transition-all duration-300 hover:border-[#20C5FE80]"
          role="img"
          aria-label={`${game.name} game card`}
        >
          {/* Image section with hover effects */}
          <div
            className={`game-card-image-section ${imageClassName} overflow-hidden rounded-lg`}
          >
            <div className="game-card-image-wrap group relative h-full">
              <div className="game-card-media h-full w-full overflow-hidden">
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
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover/card:scale-110"
                />
              </div>

              {/* Bottom overlay effect on hover */}
              <div className="pointer-events-none absolute top-1/2 right-0 bottom-0 left-0 origin-bottom scale-y-0 bg-gradient-to-t from-[#20C5FE] to-transparent transition-transform duration-300 ease-in-out will-change-transform group-hover/card:scale-y-100" />

              {/* Play Button Overlay - slides up from bottom on hover */}
              {showPlayButton && (
                <div className="pointer-events-none absolute inset-0 z-10 hidden items-end justify-center pb-4 sm:flex">
                  <button
                    onClick={handlePlayButtonClick}
                    disabled={isGameLaunching}
                    className={`flex translate-y-full cursor-pointer items-center justify-center gap-2 rounded-[50px] border border-[#20C5FE] bg-[#20C5FE] px-4 py-2.5 opacity-0 transition-all duration-300 ease-in-out disabled:opacity-50 sm:px-5 sm:py-3 ${playButtonClassName} pointer-events-auto shadow-[0_4px_14px_rgba(0,0,0,0.75)] group-hover/card:translate-y-0 group-hover/card:opacity-100`}
                  >
                    {isGameLaunching ? (
                      <>
                        <CommonLoader
                          size="sm"
                          className="text-white"
                          border="border-[#20C5FE]"
                          centered={false}
                        />
                        <span className="text-xs font-medium text-white">
                          {t('launching')}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          fill="#FFFFFF"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium text-white">
                          Play
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Game name section below the image */}
          {/* <div className="game-name-section">
          <div className="game-name-simple">
            <p
              className={`max-w-full truncate text-xs font-medium text-white sm:text-[12px] ${nameClassName}`}
            >
              {game.name}
            </p>
          </div>
        </div> */}
        </div>
      </div>
    );
  },
);

GameCard.displayName = 'GameCard';

export default GameCard;
