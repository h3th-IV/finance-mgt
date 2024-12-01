const Joi = require("joi");

const updatePasswordValidator = Joi.object({
    staffId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid staffId format. Must be a valid ObjectId.",
            "any.required": "staffId is required.",
        }),
    otp: Joi.string()
        .required()
        .messages({
            "any.required": "OTP is required.",
        }),
    pass: Joi.string()
    .min(9)
    .pattern(/[!@#$%^&*()_+:"{}[\]\\|<>,.?/~`']/)
    .required()
    .messages({
      "string.empty": "Please provide a strong password",
      "string.min": "Password must be at least 9 characters long",
      "string.pattern.base": "Password must include at least one special character",
    }),
});

module.exports = { updatePasswordValidator };
