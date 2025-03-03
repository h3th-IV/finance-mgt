const Joi = require('joi');

const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Invalid email format.',
  'string.empty': 'Email is required.',
  'any.required': 'Email is required.',
});

const passwordSchema = Joi.string().min(5).required().messages({
  'string.min': 'Password must be at least 8 characters long.',
  'string.empty': 'Password is required.',
  'any.required': 'Password is required.',
});

const loginValidator = Joi.object({
  identifier: Joi.string().required().messages({
        'any.required': 'Email or phone number is required.',
        'string.empty': 'Identifier cannot be empty.',
    }),
    password: passwordSchema,
});

const resetPasswordValidator = Joi.object({
  phone_number: Joi.string().pattern(/^[0-9]+$/).required().messages({
    "string.empty": "Please provide your phone number",
    "string.pattern.base": "Phone number must only contain digits",
  }),
  otp: Joi.string().length(5).required().messages({
    'string.length': 'OTP must be 6 characters.',
    'string.empty': 'OTP is required.',
    'any.required': 'OTP is required.',
  }),
  new_password: passwordSchema,
});

const updatePasswordValidator = Joi.object({
  otp: Joi.string().length(5).required().messages({
    'string.length': 'OTP does not meet the required length',
    'string.empty': 'OTP is required.',
    'any.required': 'OTP is required'
  }),
  password: passwordSchema,
})

const forgotPasswordValidator = Joi.object({
  email: emailSchema,
});

module.exports = {
  loginValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
  updatePasswordValidator,
};
