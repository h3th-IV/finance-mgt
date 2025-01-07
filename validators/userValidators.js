const Joi = require("joi");

const userValidationSchema = Joi.object({
  first_name: Joi.string()
    .when("accountType", { is: "individual", then: Joi.required() })
    .messages({
      "string.empty": "Please provide your first name",
    }),
  last_name: Joi.string()
    .when("accountType", { is: "individual", then: Joi.required() })
    .messages({
      "string.empty": "Please provide your last name",
    }),
  phone_number: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
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
  accountType: Joi.string()
    .valid("individual", "business")
    .required()
    .messages({
      "string.empty": "Please provide an account type",
      "any.only": "Account type must be either 'individual' or 'business'",
    }),
  business_name: Joi.string()
    .when("accountType", { is: "business", then: Joi.required() })
    .messages({
      "string.empty": "Please provide your business name",
    }),
});

module.exports = { userValidationSchema };
