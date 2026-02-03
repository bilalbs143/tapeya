import Joi from 'joi';

import { formatCurrencyWithCurrency } from '@/helpers/formatting';

export const createCryptoDepositSchema = (
  minimumAmount = 30000,
  currency = '',
) =>
  Joi.object({
    amount: Joi.number()
      .min(minimumAmount)
      .required()
      .messages({
        'number.min': `minimum_crypto_deposit_amount ${formatCurrencyWithCurrency(minimumAmount, currency)}`,
        'number.base': 'amount_must_be_valid_number',
        'any.required': 'crypto_deposit_amount_required',
      }),
    currency: Joi.string().required().messages({
      'string.empty': 'crypto_deposit_currency_required',
      'any.required': 'crypto_deposit_currency_required',
    }),
  });

// Default schema for backward compatibility
export const cryptoDepositSchema = createCryptoDepositSchema();
