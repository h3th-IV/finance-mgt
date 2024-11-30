const Joi = require("joi");

const staffValidator = Joi.object({
    first_name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "First name is required.",
            "string.min": "First name must be at least 2 characters long.",
            "string.max": "First name cannot exceed 50 characters.",
        }),
    last_name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Last name is required.",
            "string.min": "Last name must be at least 2 characters long.",
            "string.max": "Last name cannot exceed 50 characters.",
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Invalid email format.",
        }),
    dob: Joi.date()
        .iso()
        .less("now")
        .required()
        .messages({
            "date.base": "DOB must be a valid date.",
            "date.isoDate": "DOB must be in ISO format (YYYY-MM-DD).",
            "date.less": "DOB cannot be a future date.",
        }),
    role: Joi.string()
        .required()
        .messages({
            "string.empty": "Role ID is required.",
        }),
});

module.exports = { staffValidator };
