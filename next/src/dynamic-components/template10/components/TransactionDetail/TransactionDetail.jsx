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

    // Get the value from the data object using the key path
    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const value = getValue(data, key);

    // Format the value based on field type
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
            className={`h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#1D4647] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px] ${contentClassName}`}
          />
        </div>
      </div>
    );
  };

  // Define fields based on transaction type and crypto status
  const getFields = () => {
    const isDeposit = type === 'deposit';

    if (isDeposit) {
      // Deposit details: specific fields for deposit table
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

      // Non-crypto deposit: show via as payment type
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

    // Withdrawal details: specific fields for withdrawal table
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

    // Non-crypto withdrawal: show via as payment type
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
    <div className="">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        {/* Transaction Details */}
        <div className="rounded-[7px] border-[0.8px] border-[#E33A2480] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-spy-agency text-[17px] text-white">
              {title}
            </div>

            <button
              onClick={onClose}
              aria-label={t('close')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[#E33A2480] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
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
                  stroke="#E33A24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

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
  );
};

export default TransactionDetail;
