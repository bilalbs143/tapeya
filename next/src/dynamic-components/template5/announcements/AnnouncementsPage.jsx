'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllAnnouncements } from '@/website/websiteAction';

export default function AnnouncementsPage() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const router = useRouter();

  const { allAnnouncementsData = [], allAnnouncementsLoader } = useSelector(
    (state) => state.website,
  );

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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

    // If a new announcement arrives, auto-select it
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

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#20C5FE] px-8 py-2 font-extrabold text-white transition-all duration-300 hover:bg-[#1ab0e4]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#00374A] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-medium text-[white] sm:text-[30px]">
              {t('announcements')}
            </h2>
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col space-y-6">
            <div className="min-h-0 flex-1 rounded-[5px] border border-[#00374A]">
              <div className="h-full space-y-4 p-3 md:space-y-6 md:p-4 lg:p-6">
                <div className="grid h-full min-h-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  {/* Left Column - List */}
                  <div className="flex min-h-0 flex-col">
                    <h3 className="mb-4 text-[17px] font-bold text-white">
                      {t('announcements')}
                    </h3>
                    <div className="space-y-2">
                      {allAnnouncementsLoader ? (
                        <div className="py-12">
                          <CommonLoader
                            size="lg"
                            className="w-full"
                            border="border-[#20C5FE]"
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
                            className="overflow-hidden rounded-[5px] transition-all duration-300"
                          >
                            <button
                              onClick={() => {
                                userInteractedRef.current = true;
                                setSelectedAnnouncement(item.id);
                              }}
                              className={`w-full cursor-pointer rounded-[5px] px-3 py-2 text-left transition-all duration-300 md:px-4 md:py-3 ${
                                selectedAnnouncement === item.id
                                  ? 'bg-[#20C5FE]'
                                  : 'border border-[#323232] bg-transparent text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[14px] font-extrabold md:text-[16px] ${
                                    selectedAnnouncement === item.id
                                      ? 'text-black'
                                      : 'text-white'
                                  }`}
                                >
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

                  {/* Right Column - Details */}
                  <div className="flex min-h-0 flex-col">
                    <h3 className="mb-4 text-[17px] font-bold text-white">
                      {t('announcement_details')}
                    </h3>
                    <div className="scrollbar-hide min-h-0 w-full flex-1 overflow-y-auto rounded-[5px] bg-[#18202D] px-3 py-4 text-white md:px-5 md:py-6">
                      {allAnnouncementsLoader ? (
                        <div className="flex h-full items-center justify-center">
                          <CommonLoader size="lg" border="border-[#20C5FE]" />
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
    </div>
  );
}
