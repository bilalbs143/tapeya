'use client';

import { useCallback } from 'react';
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
      <div className="mx-auto w-full max-w-[400px] rounded-[24px] bg-[#312577] p-4 text-white shadow-xl sm:max-w-[500px] sm:p-6 lg:max-w-[590px] lg:p-8">
        <div className="flex items-center justify-center">
          <p className="text-lg text-[#D9D9D9]">
            {t('no_game_data_available')}
          </p>
        </div>
        <button
          onClick={handleCloseModal}
          className="mt-4 cursor-pointer rounded bg-red-500 px-4 py-2 text-white"
        >
          {t('close_modal')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[400px] rounded-[5px] border-2 border-[#03C72C4D] bg-[#060D0D] text-white shadow-xl sm:max-w-[500px] lg:max-w-[590px]">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
              {formatProviderName(game.provider)}
            </h2>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="group flex h-[33px] w-[33px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#55BC55] text-black transition-all duration-300 sm:h-[44px] sm:w-[44px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="#0B0B0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Game Image */}
          <div className="relative w-full overflow-hidden rounded-xl bg-transparent">
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
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              {/* <span className="text-sm text-gray-300">{t('provider')}:</span> */}
              <span className="text-[16px] font-bold text-white">
                {game.name}
              </span>
            </div>

            {game.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{t('category')}:</span>
                <span className="text-sm font-medium text-white">
                  {game.category}
                </span>
              </div>
            )}
          </div>

          {/* Play Button */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => canLaunch && handleGameLaunch(game.id)}
              disabled={!canLaunch || isGameLaunching}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#55BC55] text-sm font-semibold text-black transition-all duration-150 active:scale-95 disabled:opacity-50 sm:h-14 sm:text-base"
            >
              {isGameLaunching ? (
                <div className="flex items-center gap-2">
                  <CommonLoader
                    size="sm"
                    className="text-white"
                    border="border-white"
                  />
                  <span>{t('launching')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t('play_now')}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
