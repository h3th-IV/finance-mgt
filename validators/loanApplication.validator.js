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
    "business_financial.annual_revenue": Joi.number().positive().messages({
        'number.base': 'Annual revenue must be a number.',
        'number.positive': 'Annual revenue must be greater than zero.',
    }).allow("", null, 0),
    loan_duration: Joi.number().positive().integer().required().messages({
        'number.base': '"Loan duration" must be a number.',
        'number.integer': '"Loan duration" must be an integer.',
        'any.required': '"Loan duration" is required.',
    }),
    loan_purpose: Joi.string().required().messages({
        'string.empty': 'Loan purpose is required.'
    }),
    repayment_mode: Joi.string().required().messages({
        'string.empty': 'Repayment mode is required.'
    }),
    "guarantor1.name": Joi.string().when('loan_type', {
        is: 'individual',
        then: Joi.required().messages({
            'string.empty': '"Guarantor1 name" is required for individual loans.',
            'any.required': '"Guarantor1 name" is required.',
        }),
    }),
    "guarantor1.email": Joi.string().email().when('loan_type', {
        is: 'individual',
        then: Joi.required().messages({
            'string.empty': '"Guarantor1 email" is required for individual loans.',
            'string.email': '"Guarantor1 email" must be a valid email address.',
            'any.required': '"Guarantor1 email" is required.',
        }),
    }),
    "guarantor1.phone_number": Joi.string().pattern(/^[0-9]+$/).when('loan_type', {
        is: 'individual',
        then: Joi.required().messages({
            "string.empty": "Please provide your phone number for guarantor1.",
            "string.pattern.base": "Phone number must only contain digits",
        }),
    }),
    "guarantor2.name": Joi.string().when('loan_type', {
        is: 'individual',
        then: Joi.required().messages({
            'string.empty': '"Guarantor2 name" is required for individual loans.',
            'any.required': '"Guarantor2 name" is required.',
        }),
    }),
    "guarantor2.email": Joi.string().email().when('loan_type', {
        is: 'individual',
        then: Joi.required().messages({
            'string.empty': '"Guarantor2 email" is required for individual loans.',
            'string.email': '"Guarantor2 email" must be a valid email address.',
            'any.required': '"Guarantor2 email" is required.',
        }),
    }),
    "guarantor2.phone_number": Joi.string().pattern(/^[0-9]+$/).when('loan_type', {
        is: 'individual',
        then: Joi.required().messages({
            "string.empty": "Please provide your phone number for guarantor2.",
            "string.pattern.base": "Phone number must only contain digits",
        }),
    }),
    // If loan type is business, remove the guarantor fields (optional validation could be added here)
    // and you may add other required business loan fields like `company_name`, `tax_identification_number`, etc.
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
    }),
    // loan_purpose: Joi.string().valid('individual', 'business').required().messages({
    //     'string.empty': 'Loan purpose is required.',
    //     'any.only': '"Loan type" must be either "individual" or "business".',
    // }),
});

const updateLoanApplicationValidator = Joi.object({
    loan_duration: Joi.number().positive().integer().optional().messages({
        'number.base': '"Loan duration" must be a number.',
        'number.integer': '"Loan duration" must be an integer.',
    }),
    loan_amount: Joi.number().positive().optional().messages({
        'number.base': '"Loan amount" must be a number.',
        'number.positive': '"Loan amount" must be greater than zero.',
    }),
    reason: Joi.string().optional().messages({
        'string.empty': '"reason" cannot be empty.',
    }),
});

module.exports = {
    loanApplicationValidator,
    updateLoanApplicationValidator,
    loanApplicationCalcValidator,
};
