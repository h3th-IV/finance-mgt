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
    'bank_verification_number.dob': Joi.date().optional().messages({
        'date.base': '"Date of Birth" must be a valid date.',
    }),
    // 'facial_verification.pic': Joi.string().optional().messages({
    //     'string.base': '"Facial verification picture" must be a valid string.',
    // }),
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
    'document_verification.doc': Joi.string().optional().messages({
        'string.base': '"Document file" must be a valid string.',
    }),
    'document_verification.home_address': Joi.string().optional().messages({
        'string.base': '"Home address" must be a valid string.',
    }),
    'utility_bill.doc': Joi.string().optional().messages({
        'string.base': '"Utility bill document" must be a valid string.',
    }),
});
module.exports = {
    kycValidator,
};
