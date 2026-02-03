'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { useTranslations } from '@/hooks/useTranslations';
import { closeModal } from '@/slices/common/commonSlice';
import { fetchAllAnnouncements } from '@/website/websiteAction';

export default function Announcement() {
  const dispatch = useDispatch();
  const { t } = useTranslations();

  const { allAnnouncementsData = [], allAnnouncementsLoader } = useSelector(
    (state) => state.website,
  );

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const handleClose = useCallback(() => {
    dispatch(closeModal('announcement'));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllAnnouncements());
  }, [dispatch]);

  const sortedAnnouncements = useMemo(() => {
    return [...allAnnouncementsData].sort((a, b) => {
      const timeB = new Date(b?.created_at).getTime() || 0;
      const timeA = new Date(a?.created_at).getTime() || 0;
      return timeB - timeA;
    });
  }, [allAnnouncementsData]);

  const hasInitializedSelection = useRef(false);
  const userInteractedRef = useRef(false);
  const lastFirstIdRef = useRef(null);

  useEffect(() => {
    if (sortedAnnouncements.length === 0) {
      return;
    }

    const currentFirstId = sortedAnnouncements[0]?.id ?? null;

    // Initial auto-select on first load
    if (!hasInitializedSelection.current) {
      setSelectedAnnouncement(currentFirstId != null ? currentFirstId : null);
      hasInitializedSelection.current = true;
      lastFirstIdRef.current = currentFirstId != null ? currentFirstId : null;
      return;
    }

    // If a new announcement arrives (ANNOUNCEMENT_CREATED), auto-select it
    // unless the user has already interacted with the list.
    const prevFirstId = lastFirstIdRef.current;
    const nextFirstId = currentFirstId != null ? currentFirstId : null;
    if (
      nextFirstId &&
      prevFirstId !== nextFirstId &&
      !userInteractedRef.current
    ) {
      setSelectedAnnouncement(nextFirstId);
    }
    lastFirstIdRef.current = nextFirstId;
  }, [sortedAnnouncements]);

  return (
    <div className="relative flex h-[80vh] w-full flex-col overflow-hidden rounded-[5px] border-2 border-[#00374A] bg-[#060D0D] text-white shadow-xl">
      <div className="flex min-h-0 flex-1 flex-col space-y-4 p-4 sm:space-y-6 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
            {t('announcements')}
          </h2>
          <button
            onClick={handleClose}
            aria-label={t('close')}
            className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#20C5FE] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
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

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col space-y-6">
          <div className="min-h-0 flex-1 rounded-[5px] border border-[#00374A]">
            <div className="h-full space-y-4 p-3 md:space-y-6 md:p-4 lg:p-6">
              <div className="grid h-full min-h-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {/* Left Column - List */}
                <div className="flex min-h-0 flex-col">
                  <h3 className="mb-4 text-lg font-medium text-white">
                    {t('announcements')}
                  </h3>
                  <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-lg border border-[#00374A] bg-transparent p-3 md:p-5">
                    <div className="space-y-2">
                      {allAnnouncementsLoader ? (
                        <div className="py-12">
                          <CommonLoader
                            size="lg"
                            className="w-full"
                            border="border-[#2DFA1A]"
                          />
                        </div>
                      ) : allAnnouncementsData.length === 0 ? (
                        <div className="py-8 text-center">
                          <span className="text-[#9E91E6]">
                            {t('no_announcements_available')}
                          </span>
                        </div>
                      ) : (
                        sortedAnnouncements.map((item) => (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-lg transition-all duration-300"
                          >
                            <button
                              onClick={() => {
                                userInteractedRef.current = true;
                                setSelectedAnnouncement(item.id);
                              }}
                              className={`w-full cursor-pointer rounded-[10px] px-3 py-2 text-left transition-all duration-300 md:px-4 md:py-3 ${
                                selectedAnnouncement === item.id
                                  ? 'bg-[#20C5FE]'
                                  : 'border border-[#323232] bg-transparent text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium md:text-base">
                                  {item.title || t('untitled_announcement')}
                                </span>
                                <svg
                                  className="h-4 w-4 md:h-5 md:w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex min-h-0 flex-col">
                  <h3 className="mb-4 text-lg font-medium text-white">
                    {t('announcement_details')}
                  </h3>
                  <div className="scrollbar-hide min-h-0 w-full flex-1 overflow-y-auto rounded-lg border border-[#FFFFFF66] bg-transparent px-3 py-4 text-white md:px-5 md:py-6">
                    {allAnnouncementsLoader ? (
                      <div className="flex h-full items-center justify-center">
                        <CommonLoader size="lg" border="border-[#2DFA1A]" />
                      </div>
                    ) : selectedAnnouncement ? (
                      (() => {
                        const currentAnnouncement = sortedAnnouncements.find(
                          (item) => item.id === selectedAnnouncement,
                        );
                        return currentAnnouncement ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white">
                              {currentAnnouncement.title}
                            </h4>
                            <div
                              className="prose prose-invert max-w-none text-sm leading-relaxed text-[#ffffff80]"
                              dangerouslySetInnerHTML={{
                                __html: currentAnnouncement.content,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-[#ffffff80]">
                              {t('announcement_not_found')}
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[#9E91E6]">
                          {t('select_announcement')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
