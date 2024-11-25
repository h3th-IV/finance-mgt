const Joi = require('joi');

const loanApplicationValidator = Joi.object({
    loan_product: Joi.string().required().messages({
        'string.empty': '"Loan product" is required.',
        'any.required': '"Loan product" is required.',
    }),
    loan_amount: Joi.number().positive().required().messages({
        'number.base': '"Loan amount" must be a number.',
        'number.positive': '"Loan amount" must be greater than zero.',
        'any.required': '"Loan amount" is required.',
    }),
    loan_duration: Joi.number().positive().integer().required().messages({
        'number.base': '"Loan duration" must be a number.',
        'number.integer': '"Loan duration" must be an integer.',
        'any.required': '"Loan duration" is required.',
    }),
});


const updateLoanApplicationValidator = Joi.object({
    loan_duration: Joi.number().positive().integer().optional().messages({
        'number.base': '"Loan duration" must be a number.',
        'number.integer': '"Loan duration" must be an integer.',
    }),
    status: Joi.string().valid('approved', 'processing', 'declined').optional().messages({
        'string.empty': '"Status" cannot be empty.',
        'any.only': '"Status" must be one of ["approved", "processing", "declined"].',
    }),
});


module.exports = {
    loanApplicationValidator,
    updateLoanApplicationValidator,
}

