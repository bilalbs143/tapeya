import Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'please_enter_valid_email_address',
      'string.empty': 'email_is_required',
    }),
});
