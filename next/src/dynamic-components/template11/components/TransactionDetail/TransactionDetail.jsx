'use client';

import React from 'react';

import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatCurrency } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

const TransactionDetail = ({ title, data, onClose, type = 'deposit' }) => {
  const { t } = useTranslations();

  if (!data) return null;

  const isCrypto = data.via_enum === 'CRYPTO';

  const renderField = (field) => {
    const {
      key,
      label,
      type: fieldType = 'text',
      className = '',
      contentClassName = '',
    } = field;

    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const value = getValue(data, key);

    let displayValue = value;
    if (fieldType === 'currency') {
      displayValue = value ? formatCurrency(value) : 'N/A';
    } else if (fieldType === 'date') {
      displayValue = value ? formatDateTimeISO(value) : 'N/A';
    } else {
      displayValue = value || 'N/A';
    }

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="text-[14px] font-bold text-white">{label}</div>
        <div className="flex-1">
          <input
            type="text"
            value={displayValue}
            readOnly
            className={`h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#272727] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px] ${contentClassName}`}
          />
        </div>
      </div>
    );
  };

  const getFields = () => {
    const isDeposit = type === 'deposit';

    if (isDeposit) {
      if (isCrypto) {
        return [
          {
            type: 'row',
            fields: [
              { key: 'type', label: 'Payment Type' },
              { key: 'payment_id', label: t('payment_id') },
            ],
          },
          {
            type: 'row',
            fields: [
              { key: 'wallet_address', label: t('wallet_address') },
              { key: 'network_fee', label: t('network_fee') },
            ],
          },
          {
            type: 'row',
            fields: [
              { key: 'service_fee', label: t('service_fee') },
              { key: 'created_at', label: 'Created at', type: 'date' },
            ],
          },
          { key: 'updated_at', label: 'Updated at', type: 'date' },
        ];
      }

      return [
        {
          type: 'row',
          fields: [
            { key: 'via', label: 'Payment Type' },
            { key: 'created_at', label: 'Created at', type: 'date' },
          ],
        },
        { key: 'updated_at', label: 'Updated at', type: 'date' },
      ];
    }

    if (isCrypto) {
      return [
        {
          type: 'row',
          fields: [
            { key: 'type', label: 'Payment Type' },
            { key: 'payment_id', label: t('payment_id') },
          ],
        },
        {
          type: 'row',
          fields: [
            { key: 'wallet_address', label: t('wallet_address') },
            { key: 'network_fee', label: t('network_fee') },
          ],
        },
        {
          type: 'row',
          fields: [
            { key: 'service_fee', label: t('service_fee') },
            { key: 'created_at', label: 'Created at', type: 'date' },
          ],
        },
        { key: 'updated_at', label: 'Updated at', type: 'date' },
      ];
    }

    return [
      {
        type: 'row',
        fields: [
          { key: 'via', label: 'Payment Type' },
          { key: 'created_at', label: 'Created at', type: 'date' },
        ],
      },
      { key: 'updated_at', label: 'Updated at', type: 'date' },
    ];
  };

  return (
    <div className="rounded-[5px] border border-[#FEA80326] bg-transparent p-5">
      {/* Top bar: Title left, Close button right */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[25px] font-semibold text-white">{title}</div>

        <button
          onClick={onClose}
          aria-label={t('close')}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 43 43"
            fill="none"
          >
            <path
              d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
              stroke="#FEA803"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* Transaction Details */}
      <div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          <div>
            <div className="space-y-6">
              {getFields().map((field, index) => {
                if (field.type === 'row') {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-6 md:grid-cols-2"
                    >
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
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
