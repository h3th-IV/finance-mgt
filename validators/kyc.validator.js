const Joi = require('joi');

const kycValidator = Joi.object({
    'bank_verification_number.bvn': Joi.string().optional(),
    'bank_verification_number.dob': Joi.date().optional(),
    'facial_verification.pic': Joi.string().optional(),
    'document_verification.doc_type': Joi.string().valid("NIN", "INTL_PASSPORT", "DRIVERS_LICENSE").optional(),
    'document_verification.doc_no': Joi.string().optional(),
    'document_verification.doc': Joi.string().optional(),
    'document_verification.home_address': Joi.string().optional(),
});

module.exports = {
    kycValidator,
};