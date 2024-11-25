const Joi = require('joi');

const createLoanProductSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required",
    }),
    description: Joi.string().required().messages({
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
    min: Joi.number()
        .positive()
        .required()
        .less(Joi.ref('max'))
        .messages({
            "number.base": "Min must be a number",
            "number.positive": "Min must be a positive number",
            "number.less": "Min must be less than Max",
            "any.required": "Min is required",
        }),
});

const updateLoanProductSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    interest: Joi.number().positive(),
    max: Joi.number().positive(),
    min: Joi.number().positive().less(Joi.ref('max')),
}).or('name', 'description', 'interest', 'max', 'min')
.messages({
    "object.missing": "At least one field must be updated",
});

module.exports = {
    createLoanProductSchema,
    updateLoanProductSchema,
};
