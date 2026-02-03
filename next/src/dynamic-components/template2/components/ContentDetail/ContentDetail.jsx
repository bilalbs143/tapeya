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

    // Get the value from the data object using the key path
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
              className={`min-h-[120px] w-full rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 py-3 text-white ${contentClassName}`}
              style={{ borderRadius: 6 }}
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
          <div
            className={`min-h-[46px] w-full rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 py-3 text-white placeholder-white/60 ${contentClassName}`}
            style={{ borderRadius: 6 }}
          >
            <span className="text-xs md:text-sm">{value || 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Check if reply data exists
  const hasReply = data?.reply && data.reply.content;

  return (
    <div className="rounded-[10px] border border-[#FFFFFF66] bg-transparent p-5">
      {/* Top bar: Title and close button */}
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={onClose}
          aria-label={t('close')}
          className="group flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border border-white bg-transparent leading-none font-bold text-[2xl] text-white transition-all duration-300 hover:bg-white sm:h-7 sm:w-7"
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
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300 group-hover:stroke-black"
            />
          </svg>
        </button>
      </div>

      {/* Two-column layout to mirror new design */}
      <div className="">
        <div
          className={`grid grid-cols-1 gap-6 ${hasReply ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}
        >
          {/* Inquiry Details (Left) */}
          <div className="rounded-[9px] border-[0.8px] border-[#FFFFFF66] p-4">
            <div className="mb-4 text-[15px] font-semibold text-white">
              {title}
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => {
                if (field.type === 'row') {
                  return (
                    <div key={index} className="grid grid-cols-1 gap-6">
                      {field.fields.map((subField, subIndex) => (
                        <React.Fragment key={subIndex}>
                          {renderField(subField)}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                }
                return (
                  <React.Fragment key={index}>
                    {renderField(field)}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Response Details (Right) */}
          {hasReply && (
            <div className="rounded-[9px] border border-[#FFFFFF66] p-4">
              <div className="mb-4 text-[15px] font-semibold text-white">
                {t('response_details')}
              </div>

              {/* Reply Content */}
              <div className="mb-6">
                <div className="mb-2 text-[14px] font-bold text-white">
                  {t('reply_content') || 'Reply Content'}
                </div>
                <div
                  className="min-h-[180px] w-full rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 py-3 text-white"
                  style={{ borderRadius: 6 }}
                >
                  <div
                    className="text-xs break-words md:text-sm"
                    dangerouslySetInnerHTML={{ __html: data.reply.content }}
                  />
                </div>
              </div>

              {/* Reply Details grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Replied By */}
                <div>
                  <div className="mb-2 text-[14px] font-bold text-white">
                    {t('replied_by')}
                  </div>
                  <div
                    className="h-[46px] w-full rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 py-3 text-white placeholder-white/60"
                    style={{ borderRadius: 6 }}
                  >
                    <span className="text-xs md:text-sm">
                      {data.reply.creator?.name ||
                        data.reply.creator?.username ||
                        'N/A'}
                    </span>
                  </div>
                </div>

                {/* Reply At */}
                <div>
                  <div className="mb-2 text-[14px] font-bold text-white">
                    {t('reply_date')}
                  </div>
                  <div
                    className="h-[46px] w-full rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 py-3 text-white placeholder-white/60"
                    style={{ borderRadius: 6 }}
                  >
                    <span className="text-xs md:text-sm">
                      {data.reply.created_at
                        ? formatDateTimeISO(data.reply.created_at)
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Read At */}
                {data.reply.read_at && (
                  <div>
                    <div className="mb-2 text-[14px] font-bold text-white">
                      {t('read_at')}
                    </div>
                    <div
                      className="h-[46px] w-full rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 py-3 text-white placeholder-white/60"
                      style={{ borderRadius: 6 }}
                    >
                      <span className="text-xs md:text-sm">
                        {formatDateTimeISO(data.reply.read_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
