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
              className={`min-h-[120px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[#FFFFFF80] ${contentClassName}`}
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
            className={`h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px] ${contentClassName}`}
          />
        </div>
      </div>
    );
  };

  // Check if reply data exists
  const hasReply = data?.reply && data.reply.content;

  return (
    <>
      <div className="mb-4 flex items-center justify-start">
        <button
          onClick={onClose}
          aria-label={t('back')}
          className="fancy-hover-effect-orange flex items-center justify-center rounded-[4px] bg-[#D61324] px-9 py-1.5 font-extrabold text-white transition-all duration-300"
        >
          <span className="text-container">
            <span className="text">Back</span>
          </span>
        </button>
      </div>

      {/* Two-column layout to mirror new design */}
      <div className="">
        <div
          className={`grid grid-cols-1 gap-6 ${
            hasReply ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
          }`}
        >
          {/* Inquiry Details (Left) */}
          <div className="rounded-[5px] border-[0.8px] border-[#FB63214D] p-4">
            <div className="mb-4 text-[30px] font-bold text-white">{title}</div>

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
            <div className="rounded-[9px] border border-[#FB63214D] p-4">
              <div className="mb-4 text-[20px] font-extrabold text-white">
                {t('response_details')}
              </div>

              {/* Reply Content */}
              <div className="mb-6">
                <div className="mb-2 text-[16px] font-bold text-white">
                  {t('reply_content') || 'Reply Content'}
                </div>
                <div className="min-h-[180px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[#FFFFFF80]">
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
                  <div className="mb-2 text-[16px] font-bold text-white">
                    {t('replied_by')}
                  </div>
                  <input
                    type="text"
                    value={
                      data.reply.creator?.name ||
                      data.reply.creator?.username ||
                      'N/A'
                    }
                    readOnly
                    className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                  />
                </div>

                {/* Reply At */}
                <div>
                  <div className="mb-2 text-[16px] font-bold text-white">
                    {t('reply_date')}
                  </div>
                  <input
                    type="text"
                    value={
                      data.reply.created_at
                        ? formatDateTimeISO(data.reply.created_at)
                        : 'N/A'
                    }
                    readOnly
                    className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                  />
                </div>

                {/* Read At */}
                {data.reply.read_at && (
                  <div>
                    <div className="mb-2 text-[14px] font-bold text-white">
                      {t('read_at')}
                    </div>
                    <input
                      type="text"
                      value={formatDateTimeISO(data.reply.read_at)}
                      readOnly
                      className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentDetail;
