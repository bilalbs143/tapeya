'use client';

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatProviderName } from '@/helpers/stringUtils';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { clearSelectedGame, closeModal } from '@/slices/common/commonSlice';

export default function LaunchGame() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { handlePlayGame, isLaunching } = useGameLaunch();

  const game = useSelector((state) => state.common.selectedGame);

  const handleCloseModal = () => {
    dispatch(clearSelectedGame());
    dispatch(closeModal('launchGame'));
  };

  const handleGameLaunch = useCallback(
    (gameId) => {
      handlePlayGame(gameId, () => {
        dispatch(clearSelectedGame());
        dispatch(closeModal('launchGame'));
      });
    },
    [handlePlayGame, dispatch],
  );

  const isGameLaunching = game ? isLaunching(game.id) : false;
  const canLaunch = Boolean(game && game.id);

  if (!game) {
    return (
      <div className="mx-auto w-full max-w-[400px] rounded-[5px] border border-[#DBB42C4D] bg-[#1D0032] p-4 text-white shadow-xl sm:max-w-[500px] sm:p-6 lg:max-w-[550px] lg:p-8">
        <div className="space-y-6 text-center">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            {t('no_game_data_available')}
          </h2>
          <button
            onClick={handleCloseModal}
            className="neon-hover-effect mx-auto flex w-full max-w-[220px] cursor-pointer items-center justify-center rounded-[10px] border border-[#272727] px-6 py-3 text-sm font-extrabold tracking-wide text-white uppercase transition-all duration-200 focus:ring-0 focus:outline-none focus-visible:outline-none active:scale-95"
          >
            <span className="text-container">
              <span className="text">{t('close_modal')}</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[400px] transform rounded-[5px] border border-[#DBB42C4D] bg-[#1D0032] text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[520px] lg:max-w-[600px]">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bring-race text-lg text-white sm:text-xl">
                {formatProviderName(game.provider)}
              </h2>
            </div>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-[#DBB42C4D] text-black transition-all duration-300 sm:h-[35px] sm:w-[35px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:rotate-180 sm:h-6 sm:w-6"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="#DBB42C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4 rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] p-4 sm:p-6">
            {/* Game Image */}
            <div className="relative w-full overflow-hidden rounded-[10px] border border-[#272727] bg-[#0F0F0F]">
              <img
                src={
                  game.image_url ||
                  game.image ||
                  game.thumbnail ||
                  '/images/placeholders/slot.png'
                }
                alt={game.name}
                className="h-auto w-full object-cover object-center"
              />
            </div>

            {/* Game Info */}
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-[18px] font-extrabold tracking-wide text-white uppercase">
                {game.name}
              </p>
              {game.category && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#FFFFFF99] uppercase sm:justify-start">
                  <span className="font-semibold tracking-[0.2em]">
                    {t('category')}
                  </span>
                  <span className="rounded-full border border-[#272727] px-3 py-1 text-[11px] font-semibold text-white">
                    {game.category}
                  </span>
                </div>
              )}
            </div>

            {/* Play Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => canLaunch && handleGameLaunch(game.id)}
                disabled={!canLaunch || isGameLaunching}
                className="fancy-hover-effect-orange flex w-full cursor-pointer items-center justify-center rounded-[4px] bg-[#9D4EDD] px-4 py-4 text-base font-extrabold tracking-wide text-white uppercase transition-all duration-200 active:scale-95 disabled:opacity-50"
                data-hover={isGameLaunching ? t('launching') : t('play_now')}
              >
                <span className="text-container">
                  {isGameLaunching ? (
                    <span className="text flex items-center gap-2">
                      <CommonLoader
                        size="sm"
                        className="text-white"
                        border="border-white"
                      />
                      {t('launching')}
                    </span>
                  ) : (
                    <span className="text flex items-center gap-2">
                      {t('play_now')}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
