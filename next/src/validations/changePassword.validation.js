import Joi from 'joi';

export const passwordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'current_password_is_required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.empty': 'new_password_is_required',
      'string.min': 'password_must_be_min_8',
      'string.pattern.base':
        'password_must_contain_lowercase_uppercase_number_special',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword')) // Ensures it matches newPassword
    .required()
    .messages({
      'string.empty': 'please_confirm_password',
      'any.only': 'passwords_do_not_match', // Custom error when passwords don't match
    }),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'string.empty': 'current_password_is_required',
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.empty': 'password_is_required',
      'string.min': 'password_must_be_min_8',
      'string.pattern.base':
        'password_must_contain_lowercase_uppercase_number_special',
    }),
  password_confirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'passwords_must_match',
      'string.empty': 'please_confirm_password',
    }),
});
