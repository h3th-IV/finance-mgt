const Joi = require('joi');

const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Invalid email format.',
  'string.empty': 'Email is required.',
  'any.required': 'Email is required.',
});

const passwordSchema = Joi.string().min(8).required().messages({
  'string.min': 'Password must be at least 8 characters long.',
  'string.empty': 'Password is required.',
  'any.required': 'Password is required.',
});

const loginValidator = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const resetPasswordValidator = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be 6 characters.',
    'string.empty': 'OTP is required.',
    'any.required': 'OTP is required.',
  }),
  new_password: passwordSchema,
});

const forgotPasswordValidator = Joi.object({
  email: emailSchema,
});

module.exports = {
  loginValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
};
