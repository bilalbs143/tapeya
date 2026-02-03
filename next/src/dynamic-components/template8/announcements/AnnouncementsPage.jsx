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

  const [openAnnouncementId, setOpenAnnouncementId] = useState(null);

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
      setOpenAnnouncementId(currentFirstId ?? null);
      hasInitializedSelection.current = true;
      lastFirstIdRef.current = currentFirstId ?? null;
      return;
    }

    const prevFirstId = lastFirstIdRef.current;
    const nextFirstId = currentFirstId ?? null;
    if (
      nextFirstId &&
      prevFirstId !== nextFirstId &&
      !userInteractedRef.current
    ) {
      setOpenAnnouncementId(nextFirstId);
    }
    lastFirstIdRef.current = nextFirstId;
  }, [sortedAnnouncements]);

  const handleClose = () => {
    router.push('/');
  };

  const toggleAnnouncement = (id) => {
    userInteractedRef.current = true;
    setOpenAnnouncementId(openAnnouncementId === id ? null : id);
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#2DFA1A] px-8 py-2 font-semibold text-black transition-all duration-300 hover:bg-[#2DFA1A]"
        >
          {t('back')}
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-medium text-[white] sm:text-[30px]">
              {t('announcements')}
            </h2>
          </div>

          {/* Accordion Style Announcements */}
          <div className="space-y-3">
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
              sortedAnnouncements.map((item) => {
                const isOpen = openAnnouncementId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-[3px] border text-white transition-colors duration-200 ${
                      isOpen
                        ? 'border-[#2DFA1A4D] bg-[#0F1B1B]'
                        : 'border-[#2DFA1A4D]'
                    }`}
                  >
                    <button
                      onClick={() => toggleAnnouncement(item.id)}
                      className="flex w-full flex-col text-left transition-all duration-200 focus:ring-0 focus:outline-none focus-visible:outline-none"
                    >
                      <div className="flex w-full items-center justify-between px-4 py-3">
                        <span className="text-[15px] font-semibold">
                          {item.title || t('untitled_announcement')}
                        </span>

                        {/* + / − icon inside circle */}
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#2DFA1A4D] text-white">
                          <span className="text-[16px] leading-none">
                            {isOpen ? '−' : '+'}
                          </span>
                        </span>
                      </div>

                      {/* orange divider line (97% width) */}
                      {isOpen && (
                        <div className="mx-auto mb-1 h-[1px] w-[97%] bg-[#2DFA1A]" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 py-3 text-[14px] leading-relaxed text-[#B8B8B8]">
                        <div
                          className="prose prose-invert max-w-none text-sm leading-relaxed text-[#ffffff80]"
                          dangerouslySetInnerHTML={{
                            __html: item.content || t('no_content_available'),
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
