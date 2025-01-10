const Joi = require('joi');

const businessKYCValidator = Joi.object({
    'owners_partner_info': Joi.array()
        .items(
            Joi.object({
                name: Joi.string()
                    .optional()
                    .messages({
                        'string.base': 'Name must be a valid string.',
                    }),
                phone_number: Joi.string()
                    .optional()
                    .pattern(/^\d+$/)
                    .messages({
                        'string.pattern.base': 'Phone number must only contain numbers.',
                    }),
                email: Joi.string()
                    .optional()
                    .email()
                    .messages({
                        'string.email': 'Email must be a valid email address.',
                    }),
                bvn: Joi.string()
                    .optional()
                    .length(11)
                    .pattern(/^\d+$/)
                    .messages({
                        'string.length': 'BVN must be exactly 11 digits.',
                        'string.pattern.base': '"BVN" must only contain numbers.',
                    }),
            })
        )
        .optional(),
    'business_registration.certificate': Joi.string()
        .optional()
        .allow(null, '') // Allow null or empty strings for optional fields
        .messages({
            'string.base': 'Certificate must be a valid string.',
        }),
    'directors_bvn_verification': Joi.array()
        .items(
            Joi.object({
                director_name: Joi.string()
                    .optional()
                    .messages({
                        'string.base': 'Director name must be a valid string.',
                    }),
                email: Joi.string()
                    .optional()
                    .email()
                    .messages({
                        'string.email': 'Director email must be a valid email address.',
                    }),
                bvn: Joi.string()
                    .optional()
                    .length(11)
                    .pattern(/^\d+$/)
                    .messages({
                        'string.length': 'BVN must be exactly 11 digits.',
                        'string.pattern.base': 'BVN must only contain numbers.',
                    }),
            })
        )
        .optional(),
    'business_address.address': Joi.string()
        .optional()
        .allow(null, '')
        .messages({
            'string.base': 'Address must be a valid string.',
        }),
    'business_address.proof_of_address': Joi.string()
        .optional()
        .allow(null, '')
        .messages({
            'string.base': 'Proof of address must be a valid string.',
        }),
    'employee_size.size': Joi.number()
        .optional()
        .allow(null)
        .min(1)
        .messages({
            'number.base': 'Employee size must be a valid number.',
            'number.min': 'Employee size must be at least 1.',
        }),
});

module.exports = {
    businessKYCValidator,
};
