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
    "guarantor1.name": Joi.string().required().messages({
        'string.empty': '"Guarantor1 name" is required.',
        'any.required': '"Guarantor1 name" is required.',
    }),
    "guarantor1.email": Joi.string().email().required().messages({
        'string.empty': '"Guarantor1 email" is required.',
        'string.email': '"Guarantor1 email" must be a valid email address.',
        'any.required': '"Guarantor1 email" is required.',
    }),
    "guarantor1.phone_number": Joi.string().pattern(/^[0-9]+$/).required().messages({
        "string.empty": "Please provide your phone number",
        "string.pattern.base": "Phone number must only contain digits",
    }),
    "guarantor2.name": Joi.string().required().messages({
        'string.empty': '"Guarantor2 name" is required.',
        'any.required': '"Guarantor2 name" is required.',
    }),
    "guarantor2.email": Joi.string().email().required().messages({
        'string.empty': '"Guarantor2 email" is required.',
        'string.email': '"Guarantor2 email" must be a valid email address.',
        'any.required': '"Guarantor2 email" is required.',
    }),
    "guarantor2.phone_number": Joi.string().pattern(/^[0-9]+$/).required().messages({
        "string.empty": "Please provide your phone number",
        "string.pattern.base": "Phone number must only contain digits",
    }),
    // security_cheque: Joi.string().uri().required().messages({
    //     'string.empty': '"Security cheque" is required.',
    //     'string.uri': '"Security cheque" must be a valid URL.',
    //     'any.required': '"Security cheque" is required.',
    // }),
    // statement_of_account: Joi.string().uri().required().messages({
    //     'string.empty': '"Statement of account" is required.',
    //     'string.uri': '"Statement of account" must be a valid URL.',
    //     'any.required': '"Statement of account" is required.',
    // }),
    // statement_of_net_worth: Joi.string().uri().required().messages({
    //     'string.empty': '"Statement of net worth" is required.',
    //     'string.uri': '"Statement of net worth" must be a valid URL.',
    //     'any.required': '"Statement of net worth" is required.',
    // }),
});

const loanApplicationCalcValidator = Joi.object({
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
    })
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
    loanApplicationCalcValidator
}

