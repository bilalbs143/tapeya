'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import LazyImage from '@/dynamic-components/template11/components/LazyImage/LazyImage';
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

    // Generate unique filter ID for each card
    const filterId = `filter0_f_63_375_${game.id || Math.random().toString(36).substr(2, 9)}`;

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
          className={`game-card-simple ${imageClassName}`}
          role="img"
          aria-label={`${game.name} game card`}
        >
          {/* Image section */}
          <div className="game-card-image-section">
            <div className="game-card-image-wrap">
              <div className="game-card-media">
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
                  className="object-cover object-center transition-all duration-300"
                />

                {/* SVG blur effect on hover */}
                <div className="game-card-hover-svg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="261"
                    height="202"
                    viewBox="0 0 261 202"
                    fill="none"
                    className="game-card-svg-blur"
                  >
                    <g filter={`url(#${filterId})`}>
                      <ellipse
                        cx="132"
                        cy="223.5"
                        rx="125"
                        ry="76.5"
                        fill="#DFA336"
                      />
                    </g>
                    <defs>
                      <filter
                        id={filterId}
                        x="-177"
                        y="-37"
                        width="618"
                        height="521"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur
                          stdDeviation="92"
                          result="effect1_foregroundBlur_63_375"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Game name section below the image */}
          <div className="game-name-section">
            <div className="game-name-simple">
              {/* Default game name text */}
              <p
                className={`game-name-text max-w-full truncate text-xs font-medium text-white sm:text-[12px] ${nameClassName}`}
              >
                {game.name}
              </p>
              {/* Play Now text (shown on hover) */}
              <div className="game-name-play-now">
                <svg className="h-4 w-4" fill="white" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-semibold text-white uppercase sm:text-sm">
                  {t('play_now')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

GameCard.displayName = 'GameCard';

export default GameCard;
