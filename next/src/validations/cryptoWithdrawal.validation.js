import Joi from 'joi';

import { formatCurrencyWithCurrency } from '@/helpers/formatting';

export const createCryptoWithdrawalSchema = (
  minimumAmount = 30000,
  currency = '',
) =>
  Joi.object({
    address: Joi.string().min(10).required().messages({
      'string.empty': 'crypto_withdrawal_address_required',
      'string.min': 'crypto_withdrawal_address_minimum',
      'any.required': 'crypto_withdrawal_address_required',
    }),
    currency: Joi.string().required().messages({
      'string.empty': 'crypto_withdrawal_currency_required',
      'any.required': 'crypto_withdrawal_currency_required',
    }),
    amount: Joi.number()
      .min(minimumAmount)
      .required()
      .messages({
        'number.min': `minimum_crypto_deposit_amount ${formatCurrencyWithCurrency(minimumAmount, currency)}`,
        'number.base': 'amount_must_be_valid_number',
        'any.required': 'crypto_withdrawal_amount_required',
      }),
  });

// Default schema for backward compatibility
export const cryptoWithdrawalSchema = createCryptoWithdrawalSchema();
