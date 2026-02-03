'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllAnnouncements } from '@/website/websiteAction';

export default function AnnouncementsPage({ embedded = false }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslations();

  const { allAnnouncementsData = [], allAnnouncementsLoader } = useSelector(
    (state) => state.website,
  );

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const hasInitializedSelection = useRef(false);
  const userInteractedRef = useRef(false);
  const lastFirstIdRef = useRef(null);

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

  useEffect(() => {
    if (sortedAnnouncements.length === 0) return;

    const currentFirstId = sortedAnnouncements[0]?.id ?? null;

    if (!hasInitializedSelection.current) {
      setSelectedAnnouncement(currentFirstId != null ? currentFirstId : null);
      hasInitializedSelection.current = true;
      lastFirstIdRef.current = currentFirstId != null ? currentFirstId : null;
      return;
    }

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

  const handleBack = () => {
    if (embedded) return;
    router.push('/');
  };

  return (
    <div
      className={`container mx-auto px-4 text-white md:px-0 ${
        embedded ? '' : 'bg-[#000304]'
      }`}
    >
      <div className="py-8 md:py-12">
        {/* Mobile back (hidden in embedded mode) */}
        {!embedded && (
          <div className="mb-4 flex items-center justify-start md:hidden">
            <button
              onClick={handleBack}
              className="rounded-[8px] bg-[#E8D25E] px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800]"
            >
              {t('back')}
            </button>
          </div>
        )}

        <div className="space-y-6 rounded-[12px] border border-[rgba(0,0,0,0.6)] p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white uppercase md:text-2xl">
              {t('announcements')}
            </h1>
          </div>

          {/* Content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* List */}
            <div
              className={`space-y-3 rounded-[10px] border border-[rgba(0,0,0,0.6)] p-3 md:p-4 ${
                embedded ? 'bg-transparent' : 'bg-[#111111]'
              }`}
            >
              <h2 className="text-base font-semibold text-white md:text-lg">
                {t('announcements')}
              </h2>

              {allAnnouncementsLoader ? (
                <div className="flex items-center justify-center py-10">
                  <CommonLoader size="lg" border="border-[#E8D25E]" />
                </div>
              ) : sortedAnnouncements.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#BFBFBF]">
                  {t('no_announcements_available')}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedAnnouncements.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        userInteractedRef.current = true;
                        setSelectedAnnouncement(item.id);
                      }}
                      className={`w-full rounded-[8px] px-4 py-3 text-left transition-all duration-200 ${
                        selectedAnnouncement === item.id
                          ? 'text-white'
                          : 'bg-[#0B0B0B] text-white hover:bg-[#1A1A1A]'
                      }`}
                      style={
                        selectedAnnouncement === item.id
                          ? {
                            backgroundImage:
                                'linear-gradient(#f17a77, #ee5f5b 60%, #ec4d49)',
                          }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold md:text-base">
                          {item.title || t('untitled_announcement')}
                        </span>
                        <svg
                          className="h-4 w-4"
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
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div
              className={`space-y-3 rounded-[10px] border border-[rgba(0,0,0,0.6)] p-4 ${
                embedded ? 'bg-transparent' : 'bg-[#111111]'
              }`}
            >
              <h2 className="text-base font-semibold text-white md:text-lg">
                {t('announcement_details')}
              </h2>

              <div className="min-h-[260px] rounded-[8px] p-4 md:p-5">
                {allAnnouncementsLoader ? (
                  <div className="flex h-full items-center justify-center">
                    <CommonLoader size="lg" border="border-[#E8D25E]" />
                  </div>
                ) : selectedAnnouncement ? (
                  (() => {
                    const currentAnnouncement = sortedAnnouncements.find(
                      (item) => item.id === selectedAnnouncement,
                    );
                    return currentAnnouncement ? (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">
                          {currentAnnouncement.title}
                        </h3>
                        <div
                          className="prose prose-invert max-w-none text-sm leading-relaxed text-[#D9D9D9]"
                          dangerouslySetInnerHTML={{
                            __html: currentAnnouncement.content,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#BFBFBF]">
                        {t('announcement_not_found')}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#BFBFBF]">
                    {t('select_announcement')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
