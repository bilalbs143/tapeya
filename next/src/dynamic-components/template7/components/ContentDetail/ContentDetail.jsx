'use client';
import React from 'react';

import { formatDateTimeISO } from '@/helpers/dateTime';
import { useTranslations } from '@/hooks/useTranslations';

const ContentDetail = ({ title, data, onClose, fields = [] }) => {
  const { t } = useTranslations();

  if (!data) return null;

  const renderField = (field) => {
    const {
      key,
      label,
      type = 'text',
      className = '',
      contentClassName = '',
    } = field;

    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const value = getValue(data, key);

    if (type === 'html') {
      return (
        <div className={`flex flex-col gap-2 ${className}`}>
          <div className="text-[14px] font-bold text-white">{label}</div>
          <div className="flex-1">
            <div
              className={`min-h-[120px] w-full cursor-not-allowed rounded-[5px] border border-[#3E1D88] bg-transparent px-3 py-3 text-[#FFFFFF80] ${contentClassName}`}
            >
              <div
                className="text-xs break-words md:text-sm"
                dangerouslySetInnerHTML={{
                  __html: value || t('no_content_available'),
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="text-[14px] font-bold text-white">{label}</div>
        <div className="flex-1">
          <input
            type="text"
            value={value || 'N/A'}
            readOnly
            className={`h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#3E1D88] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px] ${contentClassName}`}
          />
        </div>
      </div>
    );
  };

  const hasReply = data?.reply && data.reply.content;

  return (
    <>
      <div className="mb-4 flex items-center justify-start">
        <button
          onClick={onClose}
          aria-label={t('back')}
          className="angled-button angled-button-pinks flex h-[40px] w-[120px] items-center justify-center rounded-[4px] px-9 py-1.5 font-extrabold text-white transition-all duration-300"
          data-hover={t('back')}
        >
          <div className="angled-button-inner">
            <span className="angled-button-text">{t('back')}</span>
          </div>
        </button>
      </div>

      {/* Stack both sections vertically */}
      <div className="space-y-6">
        {/* Inquiry Details */}
        <div className="rounded-[5px] border border-[#3E1D88] bg-[#331369] p-4">
          <div className="mb-4 text-[14px] font-extrabold text-white uppercase">
            {title}
          </div>

          {/* Left: Title + Status | Right: Comments */}
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
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#3E1D88] bg-transparent px-3 text-[12px] text-[#FFFFFF80]"
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
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#3E1D88] bg-transparent px-3 text-[12px] text-[#FFFFFF80]"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[14px] font-bold text-white">
                Comments
              </div>
              <div className="min-h-[136px] w-full cursor-not-allowed rounded-[5px] border border-[#3E1D88] bg-transparent px-3 py-3 text-sm text-[#FFFFFF80]">
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

        {/* Response Details */}
        <div className="rounded-[5px] border border-[#3E1D88] bg-[#3E1D88] p-4">
          <div className="mb-4 text-[14px] font-extrabold text-white uppercase">
            Response Details
          </div>

          {/* Left: Replied By, Replied At, Read At | Right: Comments */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
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
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#331369] bg-transparent px-3 text-[12px] text-[#FFFFFF80]"
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
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#331369] bg-transparent px-3 text-[12px] text-[#FFFFFF80]"
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
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#331369] bg-transparent px-3 text-[12px] text-[#FFFFFF80]"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[14px] font-bold text-white">
                {t('comments') || 'Comments'}
              </div>
              <div className="min-h-[225px] w-full cursor-not-allowed rounded-[5px] border border-[#331369] bg-transparent px-3 py-3 text-sm text-[#FFFFFF80]">
                <div
                  className="text-xs break-words md:text-sm"
                  dangerouslySetInnerHTML={{
                    __html: hasReply ? data.reply.content : 'Comments',
                  }}
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
