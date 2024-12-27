const Joi = require('joi');

const createLoanProductSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required",
    }),
    desc: Joi.string().required().messages({
        "string.empty": "Description is required",
        "any.required": "Description is required",
    }),
    interest: Joi.number().positive().required().messages({
        "number.base": "Interest must be a number",
        "number.positive": "Interest must be a positive number",
        "any.required": "Interest is required",
    }),
    max: Joi.number().positive().required().messages({
        "number.base": "Max must be a number",
        "number.positive": "Max must be a positive number",
        "any.required": "Max is required",
    }),
    min: Joi.number().positive().required().less(Joi.ref('max')).messages({
            "number.base": "Min must be a number",
            "number.positive": "Min must be a positive number",
            "number.less": "Min must be less than Max",
            "any.required": "Min is required",
    }),
    interest_type: Joi.string()
        .valid("flat_rate", "reducing_balance")
        .required()
        .messages({
            "any.only": "Interest Type must be either 'flat_rate' or 'reducing_balance'",
            "any.required": "Interest Type is required",
        }),
    duration: Joi.array()
        .items(Joi.number().positive())
        .min(1)
        .required()
        .messages({
            "array.base": "Duration must be an array of positive numbers",
            "array.min": "Duration must have at least one element",
            "any.required": "Duration is required",
        }),
});

const updateLoanProductSchema = Joi.object({
    name: Joi.string(),
    desc: Joi.string(),
    interest: Joi.number().positive(),
    max: Joi.number().positive(),
    min: Joi.number().positive().less(Joi.ref('max')),
    status: Joi.string()
        .valid("active", "archived")
        .messages({
            "any.only": "Status must be either 'active' or 'archived'",
        }),
    interest_type: Joi.string()
        .valid("flat_rate", "reducing_balance")
        .messages({
            "any.only": "Interest Type must be either 'flat_rate' or 'reducing_balance'",
        }),
    duration: Joi.array()
        .items(Joi.number().positive())
        .messages({
            "array.base": "Duration must be an array of positive numbers",
        }),
}).or('name', 'desc', 'interest', 'max', 'min', 'status', 'interest_type', 'duration')
.messages({
    "object.missing": "At least one field must be updated",
});

module.exports = {
    createLoanProductSchema,
    updateLoanProductSchema,
};
