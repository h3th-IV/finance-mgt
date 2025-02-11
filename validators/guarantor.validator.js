const Joi = require('joi');

const guarantorValidator = Joi.object({
    // loanApplicationId: Joi.string()
    //     .required()
    //     .messages({
    //         'string.base': '"Loan Application ID" must be a string.',
    //         'any.required': '"Loan Application ID" is required.',
    //     }),

    firstName: Joi.string()
        .required()
        .messages({
            'string.base': '"First Name" must be a string.',
            'any.required': '"First Name" is required.',
        }),
    middleName: Joi.string()
        .optional()
        .messages({
            'string.base': '"Middle Name" must be a string.',
        }),
    lastName: Joi.string()
        .required()
        .messages({
            'string.base': '"Last Name" must be a string.',
            'any.required': '"Last Name" is required.',
        }),

    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format.',
        'string.empty': 'Email is required.',
        'any.required': 'Email is required.',
    }),

    mobile: Joi.string()
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.pattern.base': '"Mobile" must only contain numbers.',
            'any.required': '"Mobile" is required.',
        }),
    dateOfBirth: Joi.date()
        .required()
        .messages({
            'date.base': '"Date of Birth" must be a valid date.',
            'any.required': '"Date of Birth" is required.',
        }),
    gender: Joi.string()
        .valid('Male', 'Female', 'Other')
        .required()
        .messages({
            'any.only': '"Gender" must be one of Male, Female, or Other.',
            'any.required': '"Gender" is required.',
        }),
    idNumber: Joi.string()
        .required()
        .messages({
            'string.base': '"ID Number" must be a valid string.',
            'any.required': '"ID Number" is required.',
        }),
});

module.exports = {
    guarantorValidator,
};
