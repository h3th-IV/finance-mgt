const Joi = require('joi');

const bankDetailsValidator = Joi.object({
    name: Joi.string()
    .required()
    .messages({
        'string.base': "'Recipient's name must be string.",
        'any.required': "Recipient's name is required",
    }),
    number: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
        'string.pattern.base': '"Mobile" must only contain numbers.',
        'any.required': '"Mobile" is required.',
    }),
    bank: Joi.string()
    .required()
    .messages({
        'string.base': 'Bank name must be string',
        'any.required': 'Bank name is required',
    }),
});

module.exports = {
    bankDetailsValidator,
}