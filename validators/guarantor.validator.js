const Joi = require('joi');

const guarantorValidator = Joi.object({
    firstName: Joi.string()
        .optional()
        .messages({
            'string.base': '"First Name" must be a string.',
        }),
    middleName: Joi.string()
        .optional()
        .messages({
            'string.base': '"Middle Name" must be a string.',
        }),
    lastName: Joi.string()
        .optional()
        .messages({
            'string.base': '"Last Name" must be a string.',
        }),
    email: Joi.string().email()
        .optional()
        .messages({
            'string.email': 'Invalid email format.',
        }),
    mobile: Joi.string()
        .pattern(/^\d+$/)
        .optional()
        .messages({
            'string.pattern.base': '"Mobile" must only contain numbers.',
        }),
    dateOfBirth: Joi.date()
        .optional()
        .messages({
            'date.base': '"Date of Birth" must be a valid date.',
        }),
    gender: Joi.string()
        .valid('Male', 'Female', 'Other')
        .optional()
        .messages({
            'any.only': '"Gender" must be one of Male, Female, or Other.',
        }),
    idNumber: Joi.string()
        .optional()
        .messages({
            'string.base': '"ID Number" must be a valid string.',
        }),
});

module.exports = {
    guarantorValidator,
};