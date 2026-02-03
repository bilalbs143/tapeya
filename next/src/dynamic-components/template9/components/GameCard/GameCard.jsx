'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template9/components/LazyImage/LazyImage';
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
    positionNumber = null,
    disableClipPath = false,
    hidePattern = false,
    borderColor = null,
    removeBackground = false,
    borderRadius = null,
    borderWidth = null,
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
          className="game-card-simple relative"
          role="img"
          aria-label={`${game.name} game card`}
        >
          {/* Position Number Badge - Top Left Corner (Outside Image) */}
          {positionNumber !== null &&
            (() => {
              // Determine color based on position number
              let numberColor = '#7C30E6'; // Default color for 4th and beyond
              if (positionNumber === 1) {
                numberColor = '#F9DB36';
              } else if (positionNumber === 2) {
                numberColor = '#61CAF2';
              } else if (positionNumber === 3) {
                numberColor = '#F25E4C';
              }

              return (
                <div
                  className="absolute z-30"
                  style={{
                    left: '0px',
                    top: '-6px',
                  }}
                >
                  <div
                    className="flex h-full w-full items-center justify-center font-bold"
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-alatsi), sans-serif',
                      color: numberColor,
                    }}
                  >
                    {positionNumber}
                  </div>
                </div>
              );
            })()}

          {/* Image section with hover effects - Border background layer */}
          <div
            className={`game-card-image-section ${imageClassName} relative`}
            style={{
              ...(borderColor
                ? {
                  border: `${borderWidth || '2px'} solid ${borderColor}`,
                  padding: '0',
                  ...(borderRadius ? { borderRadius: borderRadius } : {}),
                }
                : { padding: '2px' }),
              ...(removeBackground || borderColor
                ? {}
                : { background: '#7C30E6' }),
              ...(disableClipPath
                ? {}
                : {
                  clipPath:
                      'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)',
                  WebkitClipPath:
                      'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)',
                }),
              overflow: 'visible',
            }}
          >
            <div
              className="game-card-image-wrap group relative h-full"
              style={{
                ...(disableClipPath
                  ? {}
                  : {
                    clipPath:
                        'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)',
                    WebkitClipPath:
                        'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)',
                  }),
                overflow: 'visible',
              }}
            >
              <div
                className="game-card-media h-full w-full"
                style={{ overflow: 'hidden' }}
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
                  className="h-full w-full object-cover object-center transition-all duration-300"
                  style={
                    disableClipPath
                      ? {}
                      : {
                        clipPath:
                            'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)',
                        WebkitClipPath:
                            'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)',
                      }
                  }
                />
              </div>

              {/* Overlay background */}
              <div
                className="pointer-events-none absolute inset-0 z-20 bg-[rgba(219,180,44,0.3)] opacity-0 backdrop-blur-[5px] transition-opacity duration-300 sm:group-hover:opacity-100"
                style={{
                  ...(disableClipPath
                    ? {}
                    : {
                      clipPath:
                          'polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 15px)',
                      WebkitClipPath:
                          'polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 15px)',
                    }),
                }}
              />

              {/* Play Button Overlay - positioned only on the image area */}
              {showPlayButton && (
                <div
                  className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100"
                  style={
                    disableClipPath
                      ? {}
                      : {
                        clipPath:
                            'polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 15px)',
                        WebkitClipPath:
                            'polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 15px)',
                      }
                  }
                >
                  <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 sm:gap-3 sm:group-hover:opacity-100">
                    <button
                      onClick={handlePlayButtonClick}
                      disabled={isGameLaunching}
                      type="button"
                      className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#DBB42C] bg-black transition-colors disabled:opacity-50 sm:h-16 sm:w-16 ${playButtonClassName} pointer-events-auto`}
                    >
                      {isGameLaunching ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#DBB42C] border-t-transparent" />
                      ) : (
                        <svg
                          className="h-4 w-4 transition-colors sm:h-6 sm:w-6"
                          fill="#DBB42C"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`px-2 text-center text-xs font-semibold text-black sm:text-sm ${playTextClassName}`}
                    >
                      {isGameLaunching
                        ? t('launching')
                        : formatProviderName(game.provider)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pattern SVG at bottom - Completely outside all clipped containers */}
          {!hidePattern &&
            (() => {
              // Determine pattern color based on position number
              let patternColor = '#7C30E6'; // Default color for 4th and beyond
              if (positionNumber === 1) {
                patternColor = 'rgb(249, 219, 54)';
              } else if (positionNumber === 2) {
                patternColor = '#61CAF2';
              } else if (positionNumber === 3) {
                patternColor = '#F25E4C';
              }

              return (
                <div
                  className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
                  style={{ bottom: '-5px', overflow: 'visible' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="47"
                    height="14"
                    viewBox="0 0 47 14"
                    fill="none"
                    style={{ display: 'block' }}
                  >
                    <g clipPath={`url(#clip0_47_250_${game.id})`}>
                      <rect
                        width="5.59317"
                        height="19.3859"
                        transform="matrix(0.942261 0.334878 -0.417386 0.908729 7.78503 -3.06262)"
                        fill={patternColor}
                      />
                      <rect
                        width="5.59317"
                        height="19.3859"
                        transform="matrix(0.942261 0.334878 -0.417386 0.908729 19.0999 -3.06262)"
                        fill={patternColor}
                      />
                      <rect
                        width="5.59317"
                        height="19.3859"
                        transform="matrix(0.942261 0.334878 -0.417386 0.908729 30.4149 -3.06262)"
                        fill={patternColor}
                      />
                      <rect
                        width="5.59317"
                        height="19.3859"
                        transform="matrix(0.942261 0.334878 -0.417386 0.908729 41.7298 -3.06262)"
                        fill={patternColor}
                      />
                    </g>
                    <defs>
                      <clipPath id={`clip0_47_250_${game.id}`}>
                        <rect width="47" height="14" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              );
            })()}

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
