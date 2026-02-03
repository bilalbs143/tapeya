import Joi from 'joi';

export const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'username_is_required',
    'string.min': 'username_must_be_min_3',
    'string.max': 'username_must_not_exceed_50',
  }),

  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'full_name_is_required',
    'string.min': 'full_name_must_be_min_2',
    'string.max': 'full_name_must_not_exceed_100',
  }),

  nickname: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'nickname_is_required',
    'string.min': 'nickname_must_be_min_2',
    'string.max': 'nickname_must_not_exceed_50',
  }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
      ),
    )
    .required()
    .messages({
      'string.empty': 'password_is_required',
      'string.min': 'password_must_be_min_8',
      'string.max': 'password_must_not_exceed_100',
      'string.pattern.base': 'password_pattern_base',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'string.empty': 'please_confirm_password',
    'any.only': 'passwords_do_not_match',
  }),

  dateOfBirth: Joi.date().max('now').required().messages({
    'date.base': 'please_enter_valid_date',
    'date.max': 'date_of_birth_cannot_be_future',
    'any.required': 'date_of_birth_is_required',
  }),

  phone: Joi.string().min(10).max(15).pattern(/^\d+$/).required().messages({
    'string.empty': 'phone_number_is_required',
    'string.min': 'phone_number_must_be_min_10',
    'string.max': 'phone_number_must_not_exceed_15',
    'string.pattern.base': 'phone_number_must_contain_only_digits',
  }),

  referralCode: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'referral_code_is_required',
    'string.min': 'referral_code_must_be_min_3',
    'string.max': 'referral_code_must_not_exceed_50',
  }),

  bank: Joi.string().required().messages({
    'string.empty': 'please_select_bank',
  }),

  accountHolder: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'account_holder_name_is_required',
    'string.min': 'account_holder_name_must_be_min_2',
    'string.max': 'account_holder_name_must_not_exceed_100',
  }),

  accountNumber: Joi.string()
    .min(5)
    .max(20)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.empty': 'account_number_is_required',
      'string.min': 'account_number_must_be_min_5',
      'string.max': 'account_number_must_not_exceed_20',
      'string.pattern.base': 'account_number_must_contain_only_digits',
    }),
});
