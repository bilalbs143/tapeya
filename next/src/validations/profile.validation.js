import Joi from 'joi';

export const profileSchema = Joi.object({
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  email: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  street: Joi.string().trim().optional().allow(''),
  state: Joi.string().trim().optional().allow(''),
  country: Joi.string().trim().optional().allow(''),
  city: Joi.string().trim().optional().allow(''),
  postalCode: Joi.string().trim().optional().allow(''),
});
