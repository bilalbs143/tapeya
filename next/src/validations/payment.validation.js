import Joi from 'joi';

import { formatCurrencyWithCurrency } from '@/helpers/formatting';

export const createPaymentBankSchema = (
  minAmount = 25000,
  maxAmount = 50000000,
  currency = '',
) =>
  Joi.object({
    sendingOption: Joi.string().required().messages({
      'string.empty': 'sending_bank_is_required',
      'any.required': 'sending_bank_is_required',
    }),
    receivingOption: Joi.string().required().messages({
      'string.empty': 'receiving_bank_is_required',
      'any.required': 'receiving_bank_is_required',
    }),
    amount: Joi.number()
      .min(minAmount)
      .max(maxAmount)
      .required()
      .messages({
        'number.min': `minimum_deposit_amount ${formatCurrencyWithCurrency(minAmount, currency)}`,
        'number.max': `maximum_deposit_amount ${formatCurrencyWithCurrency(maxAmount, currency)}`,
        'number.base': 'please_enter_valid_amount',
        'any.required': 'deposit_amount',
      }),
    transactionNumber: Joi.string().optional().allow('', null).messages({
      'string.empty': 'transaction_number',
    }),
    receiptFile: Joi.any().optional().allow(null).messages({
      'any.required': 'receipt_file_required',
    }),
    termsAccepted: Joi.boolean().valid(true).required().messages({
      'any.only': 'terms_agreement',
      'any.required': 'terms_agreement',
    }),
  });

// Default schema for backward compatibility
export const paymentBankSchema = createPaymentBankSchema();

export const validateAmount = (amount, minAmount, maxAmount) => {
  const numAmount = parseInt(amount);

  if (numAmount < minAmount) {
    return 'minimum_transaction_amount_30000';
  }

  if (numAmount > maxAmount) {
    return 'please_enter_valid_amount';
  }

  return null;
};
