import Joi from 'joi';

export const customerInquirySchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'inquiry_title_required',
    'string.min': 'inquiry_title_minimum',
    'string.max': 'inquiry_title_maximum',
    'any.required': 'inquiry_title_required',
  }),
  content: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'inquiry_content_required',
    'string.min': 'inquiry_content_minimum',
    'string.max': 'inquiry_content_maximum',
    'any.required': 'inquiry_content_required',
  }),
});
