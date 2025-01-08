const Joi = require('joi');

const kycValidator = Joi.object({
    'email.address': Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': '"Email" must be a valid email address.',
        }),
    'bank_verification_number.bvn': Joi.string()
        .length(11)
        .pattern(/^\d+$/)
        .optional()
        .messages({
            'string.length': '"BVN" must be exactly 11 digits.',
            'string.pattern.base': '"BVN" must only contain numbers.',
        }),
    'document_verification.doc_type': Joi.string()
        .valid("NIN", "INTL_PASSPORT", "DRIVERS_LICENSE")
        .optional()
        .messages({
            'any.only': '"Document type" must be one of NIN, INTL_PASSPORT, or DRIVERS_LICENSE.',
        }),
    'document_verification.doc_no': Joi.string()
        .length(11)
        .pattern(/^\d+$/)
        .optional()
        .messages({
            'string.length': '"Document Number" must be exactly 11 digits.',
            'string.pattern.base': '"Document Number" must only contain numbers.',
        }),
    'address.address': Joi.string()
        .optional()
        .messages({
            'string.base': 'Address must be a valid string.',
        }),
    'address.proof_of_address': Joi.string()
        .optional()
        .messages({
            'string.base': 'Proof of address must be a valid string.',
        }),
    'employment_info.employment_status': Joi.string()
        .optional()
        .valid("employee", "self_employed", "worker")
        .messages({
            'any.only': 'Employment status must be one of employee, self_employed, or worker.',
        }),
    'employment_info.employer_name': Joi.string()
        .optional()
        .when('employment_info.employment_status', {
            is: 'self_employed',
            then: Joi.forbidden(),
            otherwise: Joi.optional().messages({
                'string.base': "Employer name must be a valid string.",
            }),
        }),
    'employment_info.employer_phone': Joi.string()
        .optional()
        .pattern(/^\d+$/)
        .when('employment_info.employment_status', {
            is: 'self_employed',
            then: Joi.forbidden(),
            otherwise: Joi.optional().messages({
                'string.pattern.base': "Employer phone must contain only digits.",
            }),
        }),
    'employment_info.employer_email': Joi.string()
        .optional()
        .email()
        .when('employment_info.employment_status', {
            is: 'self_employed',
            then: Joi.forbidden(),
            otherwise: Joi.optional().messages({
                'string.email': "Employer email must be a valid email address.",
            }),
        }),
    'employment_info.employer_address': Joi.string()
        .optional()
        .when('employment_info.employment_status', {
            is: 'self_employed',
            then: Joi.forbidden(),
            otherwise: Joi.optional().messages({
                'string.base': "Employer address must be a valid string.",
            }),
        }),
    'employment_info.job_title': Joi.string()
        .optional()
        .messages({
            'string.base': "Job title must be a valid string.",
        }),
    'employment_info.income_per_period': Joi.string()
        .optional()
        .messages({
            'string.base': "Income per period must be a valid string.",
        }),
});

module.exports = {
    kycValidator,
};

