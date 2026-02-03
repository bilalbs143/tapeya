import Joi from 'joi';

import { formatCurrencyWithCurrency } from '@/helpers/formatting';

export const createWithdrawalSchema = (minimumAmount = 30000, currency = '') =>
  Joi.object({
    withdrawAmount: Joi.number()
      .min(minimumAmount)
      .required()
      .messages({
        'number.min': `minimum_withdrawal_amount ${formatCurrencyWithCurrency(minimumAmount, currency)}`,
        'number.base': 'please_enter_valid_amount',
        'any.required': 'withdrawal_amount_placeholder',
      }),
  });

// Default schema for backward compatibility
export const withdrawalSchema = createWithdrawalSchema();
