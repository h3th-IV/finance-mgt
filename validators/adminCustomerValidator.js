const Joi = require('joi');

// Validator for customerData
const customerDataSchema = Joi.object({
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
        .messages({
            "string.pattern.base": "Phone number must be in valid international format.",
            "any.required": "Phone number is required.",
        }),
    otp: Joi.string().length(6).required()
        .messages({
            "string.length": "OTP must be exactly 6 characters long.",
            "any.required": "OTP is required.",
        }),
    accountType: Joi.string().valid('individual', 'business').required()
        .messages({
            "any.only": "Account type must be 'individual' or 'business'.",
            "any.required": "Account type is required.",
        }),
    first_name: Joi.string().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "First name is required for individual accounts." }),
    last_name: Joi.string().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "Last name is required for individual accounts." }),
    business_name: Joi.string().when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "Business name is required for business accounts." }),
});

// Validator for kycData
const kycDataSchema = Joi.object({
    email_address: Joi.string().email().required()
        .messages({
            "string.email": "Email address must be valid.",
            "any.required": "Email address is required.",
        }),
    bvn: Joi.string().length(11).pattern(/^\d+$/).when('accountType', { is: 'individual', then: Joi.required() })
        .messages({
            "string.length": "BVN must be exactly 11 digits.",
            "string.pattern.base": "BVN must contain only numbers.",
            "any.required": "BVN is required for individual accounts.",
        }),
    dob: Joi.date().iso().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "Date of birth is required for individual accounts." }),
    doc_type: Joi.string().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "Document type is required for individual accounts." }),
    doc_no: Joi.string().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "Document number is required for individual accounts." }),
    doc: Joi.string().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "Document file is required for individual accounts." }),
    address: Joi.string().required().messages({ "any.required": "Address is required." }),
    proof_of_address: Joi.string().required().messages({ "any.required": "Proof of address is required." }),
    employment_status: Joi.string().when('accountType', { is: 'individual', then: Joi.required() })
        .messages({ "any.required": "Employment status is required for individual accounts." }),
    employer_name: Joi.string().when('employment_status', { is: 'employed', then: Joi.required() })
        .messages({ "any.required": "Employer name is required when employed." }),
    employer_phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).when('employment_status', { is: 'employed', then: Joi.required() })
        .messages({ "string.pattern.base": "Employer phone number must be valid when employed." }),
    employer_email: Joi.string().email().when('employment_status', { is: 'employed', then: Joi.required() })
        .messages({ "string.email": "Employer email must be valid when employed." }),
    employer_address: Joi.string().when('employment_status', { is: 'employed', then: Joi.required() })
        .messages({ "any.required": "Employer address is required when employed." }),
    job_title: Joi.string().when('employment_status', { is: 'employed', then: Joi.required() })
        .messages({ "any.required": "Job title is required when employed." }),
    income_per_period: Joi.number().when('employment_status', { is: 'employed', then: Joi.required() })
        .messages({ "any.required": "Income per period is required when employed." }),

    // Business-specific fields
    owners_partner_info: Joi.array().items(
        Joi.object({
                    name: Joi.string()
                        .allow('', null)
                        .optional()
                        .messages({
                            'string.base': 'Name must be a valid string.',
                        }),
                    phone_number: Joi.string()
                        .allow('', null)
                        .optional()
                        .pattern(/^\d*$/)
                        .messages({                                'string.pattern.base': 'Phone number must only contain numbers.',
                        }),
                    email: Joi.string()
                        .allow('', null)
                        .optional()
                        .email()
                        .messages({
                            'string.email': 'Email must be a valid email address.',
                        }),
                    bvn: Joi.string()
                        .allow('', null)
                        .optional()
                        .length(11)
                        .pattern(/^\d*$/)
                        .messages({
                            'string.length': 'BVN must be exactly 11 digits.',
                            'string.pattern.base': '"BVN" must only contain numbers.',
                        }),
        })
    ).when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "Owners/partner info is required for business accounts." }),
    business_address: Joi.string().when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "Business address is required for business accounts." }),
    type: Joi.string().when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "Business type is required for business accounts." }),
    date_of_corporation: Joi.date().iso().when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "Date of corporation is required for business accounts." }),
    employee_size: Joi.number().integer().min(1).when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "Employee size is required for business accounts." }),
    cac_number: Joi.string().when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "CAC number is required for business accounts." }),
    cac_certificate: Joi.string().when('accountType', { is: 'business', then: Joi.required() })
        .messages({ "any.required": "CAC certificate is required for business accounts." }),
});

module.exports = {
    customerDataSchema,
    kycDataSchema,
};
