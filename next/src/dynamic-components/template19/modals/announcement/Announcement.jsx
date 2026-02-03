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
    if (sortedAnnouncements.length === 0) return;

    const currentFirstId = sortedAnnouncements[0]?.id ?? null;

    if (!hasInitializedSelection.current) {
      setSelectedAnnouncement(currentFirstId);
      hasInitializedSelection.current = true;
      lastFirstIdRef.current = currentFirstId;
      return;
    }

    if (
      lastFirstIdRef.current !== currentFirstId &&
      !userInteractedRef.current
    ) {
      setSelectedAnnouncement(currentFirstId);
    }

    lastFirstIdRef.current = currentFirstId;
  }, [sortedAnnouncements]);

  return (
    <div className="relative mx-auto max-h-[90vh] w-full max-w-[1479px] transform overflow-y-auto rounded-[7px] border border-[rgba(6,214,160,0.3)] text-white shadow-xl transition-all duration-300 ease-out">
      {/* Background Image Layer (match Register modal) */}
      <div
        className="absolute inset-0 rounded-[7px]"
        style={{
          backgroundImage:
            "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/login-bg-19.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      <div className="announcement-modal relative z-10 mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[5px]">
        <div className="flex min-h-0 flex-1 flex-col space-y-4 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t('announcements')}
            </h2>

            <button
              onClick={handleClose}
              aria-label={t('close')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full border-none bg-transparent ring-0 transition-transform outline-none hover:scale-110 focus:ring-0 focus:outline-none active:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 43 43"
                fill="none"
                className="stroke-[rgba(6,214,160,0.3)]"
              >
                <path
                  d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col space-y-6">
            <div className="min-h-0 flex-1 overflow-hidden rounded-[5px] border border-[rgba(6,214,160,0.3)]">
              <div className="h-full space-y-4 overflow-hidden p-3 md:space-y-6 md:p-4 lg:p-6">
                <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-hidden md:grid-cols-2 md:gap-6">
                  {/* Left Column - List */}
                  <div className="flex min-h-0 flex-col overflow-hidden">
                    <h3 className="mb-4 text-[17px] font-bold text-white">
                      {t('announcements')}
                    </h3>

                    {/* SCROLL WITHOUT SCROLLBAR */}
                    <div className="scrollbar-hide min-h-0 flex-1 space-y-2 overflow-y-auto">
                      {allAnnouncementsLoader ? (
                        <div className="py-12">
                          <CommonLoader
                            size="lg"
                            className="w-full"
                            border="border-[#06D6A04D]"
                          />
                        </div>
                      ) : allAnnouncementsData.length === 0 ? (
                        <div className="py-8 text-center">
                          <span className="text-white">
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
                              className={`w-full cursor-pointer rounded-[5px] px-3 py-2 text-left transition-all duration-300 md:px-4 md:py-3 ${selectedAnnouncement === item.id
                                ? 'border border-[#06D6A04D] bg-[#0F50451A]'
                                : 'border border-[#06D6A04D] bg-transparent text-white'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[14px] font-extrabold md:text-[16px] ${selectedAnnouncement === item.id
                                    ? 'text-white'
                                    : 'text-white'
                                    }`}
                                >
                                  {item.title || t('untitled_announcement')}
                                </span>
                                <svg
                                  className={`h-4 w-4 transition-colors md:h-5 md:w-5 ${selectedAnnouncement === item.id
                                    ? 'text-[#DFA336]'
                                    : 'text-white'
                                    }`}
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
                  <div className="flex min-h-0 flex-col overflow-hidden">
                    <h3 className="mb-4 text-[17px] font-bold text-white">
                      {t('announcement_details')}
                    </h3>

                    {/* SCROLL WITHOUT SCROLLBAR */}
                    <div className="scrollbar-hide min-h-0 w-full flex-1 overflow-y-auto rounded-[5px] bg-[#1E1E1E4D] px-3 py-4 text-white md:px-5 md:py-6">
                      {allAnnouncementsLoader ? (
                        <div className="flex h-full items-center justify-center">
                          <CommonLoader size="lg" border="border-[#06D6A04D]" />
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
                          <span className="text-white">
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
