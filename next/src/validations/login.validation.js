import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    'string.min': 'username_must_be_min_3',
    'string.empty': 'username_is_required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'password_must_be_min_8',
    'string.empty': 'password_is_required',
  }),
});
