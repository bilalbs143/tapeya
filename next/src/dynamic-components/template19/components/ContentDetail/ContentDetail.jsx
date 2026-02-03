'use client';
import React from 'react';

import { formatDateTimeISO } from '@/helpers/dateTime';
import { useTranslations } from '@/hooks/useTranslations';

const ContentDetail = ({ title, data, onClose, fields = [] }) => {
  const { t } = useTranslations();

  if (!data) return null;

  const hasReply = data?.reply && data.reply.content;

  return (
    <>
      {/* Back Button */}
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={onClose}
          aria-label={t('back')}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
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

      <div className="space-y-6 rounded-[7px] border border-[rgba(6,214,160,0.3)] bg-[#14213D]/60 p-4">
        {/* ================= Inquiry Details (UNCHANGED) ================= */}
        <div className="rounded-[5px] p-3">
          <div className="mb-4 text-[25px] font-extrabold text-white uppercase">
            {title}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 text-[14px] font-bold text-white">
                  Title
                </div>
                <input
                  type="text"
                  value={data.title || 'Title'}
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 text-[12px] text-white"
                />
              </div>

              <div>
                <div className="mb-2 text-[14px] font-bold text-white">
                  Status
                </div>
                <input
                  type="text"
                  value={data.status || 'Status'}
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 text-[12px] text-white"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[14px] font-bold text-white">
                Comments
              </div>
              <div className="min-h-[136px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 py-3 text-sm text-white">
                <div
                  className="text-xs break-words md:text-sm"
                  dangerouslySetInnerHTML={{
                    __html:
                      data?.content ||
                      data?.description ||
                      t('no_content_available'),
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mb-6 h-[1px] bg-[#06D6A0] md:w-[98%]" />

        {/* ================= Response Details  ================= */}
        <div className="rounded-[5px] bg-transparent p-4">
          <div className="mb-4 text-[25px] font-extrabold text-white uppercase">
            Response Details
          </div>

          {/* LEFT = Reply Content | RIGHT = Meta */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
            {/* LEFT SIDE – Reply Content */}
            <div>
              <div className="mb-2 text-[14px] font-bold text-white">
                {t('comments') || 'Comments'}
              </div>
              <div className="min-h-[260px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 py-3 text-sm text-white">
                <div
                  className="text-xs break-words md:text-sm"
                  dangerouslySetInnerHTML={{
                    __html: hasReply ? data.reply.content : 'Comments',
                  }}
                />
              </div>
            </div>

            {/* RIGHT SIDE – Reply Meta */}
            <div className="flex flex-col gap-8">
              <div>
                <div className="mb-2 text-[14px] font-bold text-white">
                  {t('replied_by') || 'Replied By'}
                </div>
                <input
                  type="text"
                  value={
                    data.reply?.creator?.name ||
                    data.reply?.creator?.username ||
                    'Replied By'
                  }
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 text-[12px] text-white"
                />
              </div>

              <div>
                <div className="mb-2 text-[14px] font-bold text-white">
                  {t('replied_at') || 'Replied At'}
                </div>
                <input
                  type="text"
                  value={
                    data.reply?.created_at
                      ? formatDateTimeISO(data.reply.created_at)
                      : 'Replied At'
                  }
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 text-[12px] text-white"
                />
              </div>

              <div>
                <div className="mb-2 text-[14px] font-bold text-white">
                  {t('read_at') || 'Read At'}
                </div>
                <input
                  type="text"
                  value={
                    data.reply?.read_at
                      ? formatDateTimeISO(data.reply.read_at)
                      : 'Read At'
                  }
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 text-[12px] text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentDetail;
