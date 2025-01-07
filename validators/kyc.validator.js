// const Joi = require('joi');

// const kycValidator = Joi.object({
//     'email.address': Joi.string()
//         .email()
//         .optional()
//         .messages({
//             'string.email': '"Email" must be a valid email address.',
//         }),
//     'bank_verification_number.bvn': Joi.string()
//         .length(11)
//         .pattern(/^\d+$/)
//         .optional()
//         .messages({
//             'string.length': '"BVN" must be exactly 11 digits.',
//             'string.pattern.base': '"BVN" must only contain numbers.',
//         }),
//     // 'facial_verification.pic': Joi.string().optional().messages({
//     //     'string.base': '"Facial verification picture" must be a valid string.',
//     // }),
//     'document_verification.doc_type': Joi.string()
//         .valid("NIN", "INTL_PASSPORT", "DRIVERS_LICENSE")
//         .optional()
//         .messages({
//             'any.only': '"Document type" must be one of NIN, INTL_PASSPORT, or DRIVERS_LICENSE.',
//         }),
//     'document_verification.doc_no': Joi.string()
//         .length(11)
//         .pattern(/^\d+$/)
//         .optional()
//         .messages({
//             'string.length': '"Document Number" must be exactly 11 digits.',
//             'string.pattern.base': '"Document Number" must only contain numbers.',
//         }),
//     'document_verification.doc': Joi.string()
//     .optional()
//     .messages({
//         'string.base': '"Document file" must be a valid string.',
//         "string.empty": "Please provide a document for verification",
//     }),
//     'utility_bill.doc': Joi.string()
//     .optional()
//     .messages({
//         'string.base': '"Utility bill document" must be a valid string.',
//         "string.empty": "Please provide a utility bill",
//     }),
//     'utility_bill.home_address': Joi.string()
//     .optional()
//     .messages({
//         'string.base': '"Home address" must be a valid string.',
//         "string.empty": "Please provide your home address",
//     }),
//     'address.address': Joi.string()
//     .optional()
//     .messages({
//         'string.base': 'address must be a valid string.',
//         "string.empty": "Please provide your address",
//     }),
//     'address.proof_of_address': Joi.string()
//     .optional()
//     .messages({
//         'string.base': 'proof of address must be a valid string.',
//     }),
//     'employment_info.employment_status': Joi.string()
//     .valid("employee", "self_employed", "worker")
//     .optional()
//     .messages({
//         'any.only': 'employment_status must be one of employee,self_employed, or worker',
//         "string.empty": "Please select your employment type",
//     }),
//     'employment_info.employer.name': Joi.string()
//     .optional()
//     .messages({
//         'string.base': 'employer name must be a valid string.',
//         "string.empty": "Please provide your employer's name",
//     }),
//     'employment_info.employer_email': Joi.string()
//     .optional()
//     .messages({
//         'string.base': 'employer email must be a valid string.',
//         "string.empty": "Please provide your employer's email",
//     }),
//     'employment_info.employer_address': Joi.string()
//     .email()
//     .optional()
//     .messages({
//         'string.base': 'employer_address must be a valid string.',
//         "string.empty": "Please provide your employer's address",
//     }),
//     'employment_info.employer_phone': Joi.string()
//     .pattern(/^\d+$/)
//     .optional()
//     .messages({
//         "string.empty": "Please provide your employer's phone number",
//         "string.pattern.base": "Phone number must only contain digits",
//     }),
//     'employment_info.job_title': Joi.string()
//     .optional()
//     .messages({
//         'string.base': 'job title must be a valid string.',
//         'string.empty': 'Please provide your job title',
//     }),
//     'employment_info.income_per_period': Joi.string()
//     .optional()
//     .messages({
//         "string.base": "income per period must be a valid string",
//         "string.empty": "Please provide your income per period",
//     })
// });

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
    'utility_bill.doc': Joi.string()
        .optional()
        .messages({
            'string.base': '"Utility bill document" must be a valid string.',
        }),
    'utility_bill.home_address': Joi.string()
        .optional()
        .messages({
            'string.base': '"Home address" must be a valid string.',
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

