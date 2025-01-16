const Joi = require('joi');

// Validator for customerData
const customerDataValidators = Joi.object({
    phone_number: Joi.string().pattern(/^\d*$/).optional().allow('')
        .messages({
            "string.pattern.base": "Phone number must only contain numbers.",
        }),
    accountType: Joi.string().valid('individual', 'business').optional().allow('')
        .messages({
            "any.only": "Account type must be 'individual' or 'business'.",
        }),
    first_name: Joi.string().optional().allow(''),
    last_name: Joi.string().optional().allow(''),
    business_name: Joi.string().optional().allow(''),
});

// Validator for kycData
const kycDataValidators = Joi.object({
    email_address: Joi.string().email().optional().allow('')
        .messages({
            "string.email": "Email address must be valid.",
        }),
    bvn: Joi.string().length(11).pattern(/^\d+$/).optional().allow('')
        .messages({
            "string.length": "BVN must be exactly 11 digits.",
            "string.pattern.base": "BVN must contain only numbers.",
        }),
    dob: Joi.date().iso().optional().allow(null, ''),
    doc_type: Joi.string().optional().allow(''),
    doc_no: Joi.string().optional().allow(''),
    doc: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    proof_of_address: Joi.string().optional().allow(''),
    employment_status: Joi.string().optional().allow(''),
    employer_name: Joi.string().optional().allow(''),
    employer_phone: Joi.string().pattern(/^\d*$/).optional().allow('')
        .messages({
            "string.pattern.base": "Employer phone number must only contain numbers.",
        }),
    employer_email: Joi.string().email().optional().allow('')
        .messages({
            "string.email": "Employer email must be valid.",
        }),
    employer_address: Joi.string().optional().allow(''),
    job_title: Joi.string().optional().allow(''),
    income_per_period: Joi.string().optional().allow(''),

    owners_partner_info: Joi.array().items(
        Joi.object({
            name: Joi.string().optional().allow('', null),
            phone_number: Joi.string().pattern(/^\d*$/).optional().allow('', null)
                .messages({
                    "string.pattern.base": "Phone number must contain only numbers.",
                }),
            email: Joi.string().email().optional().allow('', null)
                .messages({
                    "string.email": "Email must be a valid email address.",
                }),
            bvn: Joi.string().length(11).pattern(/^\d*$/).optional().allow('', null)
                .messages({
                    "string.length": "BVN must be exactly 11 digits.",
                    "string.pattern.base": "BVN must contain only numbers.",
                }),
        }).optional()
    ).optional().allow(null),

    business_address: Joi.string().optional().allow(''),
    business_type: Joi.string().optional().allow(''),
    date_of_corporation: Joi.date().iso().optional().allow(null, ''),
    employee_size: Joi.number().integer().positive().optional()
        .when('$accountType', { 
            is: 'business', 
            then: Joi.required(), 
            otherwise: Joi.forbidden() // disallow for individuals
        })
        .messages({
            "number.base": "Employee size must be a number.",
            "number.integer": "Employee size must be an integer.",
            "number.positive": "Employee size must be a positive number.",
            "any.required": "Employee size is required for business accounts.",
            "any.unknown": "Employee size is not allowed for individual accounts.",
        }),
    cac_number: Joi.string().optional().allow(''),
    cac_certificate: Joi.string().optional().allow(''),
});

module.exports = {
    customerDataValidators,
    kycDataValidators,
};
