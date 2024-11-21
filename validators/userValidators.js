const Joi = require("joi");

const userValidationSchema = Joi.object({
  first_name: Joi.string().required().messages({
    "string.empty": "Please provide your first name",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Please provide your last name",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Please provide your email address",
    "string.email": "Invalid email format",
  }),
  number: Joi.string().pattern(/^[0-9]+$/).required().messages({
    "string.empty": "Please provide your phone number",
    "string.pattern.base": "Phone number must only contain digits",
  }),
  password: Joi.string()
    .min(9)
    .pattern(/[!@#$%^&*()_+:"{}[\]\\|<>,.?/~`']/)
    .required()
    .messages({
      "string.empty": "Please provide a strong password",
      "string.min": "Password must be at least 9 characters long",
      "string.pattern.base": "Password must include at least one special character",
    }),
});

module.exports = { userValidationSchema };
