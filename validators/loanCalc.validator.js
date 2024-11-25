const Joi = require('joi');

const loanCalculatorValidator = Joi.object({
    loan_amount: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Loan amount must be a number.",
            "number.positive": "Loan amount must be a positive number.",
            "any.required": "Loan amount is required.",
        }),
    duration: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Duration must be a number.",
            "number.integer": "Duration must be an integer.",
            "number.positive": "Duration must be a positive number.",
            "any.required": "Duration is required.",
        }),
    interest: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Interest rate must be a number.",
            "number.positive": "Interest rate must be a positive number.",
            "any.required": "Interest rate is required.",
        }),
});

module.exports = { loanCalculatorValidator };
