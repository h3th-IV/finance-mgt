const mongoose = require("mongoose");
const User = require("./user");
const LoanProduct = require("./loanProduct");
const Staff = require("./staff");
const { required } = require("joi");

const LoanApplication = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        loan_id: {
            type: String,
        },
        loan_product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LoanProduct",
            required: true,
        },
        interest_rate: {
            type: Number,
        },
        loan_amount: {
            type: Number,
        },
        loan_duration: {
            type: Number,
        },
        statement_of_account: {
            type: String,
        },
        statement_of_networth: {
            type: String,
        },
        security_cheque: {
            type: String,
        },
        guarantor1: {
            name: { type: String, required: true },
            email: { type: String, required: true },
        },
        guarantor2: {
            name: { type: String, required: true },
            email: { type: String, required: true },
        },
        date_disbursed: {
            type: Date,
        },
        status: {
            type: String,
            enum: [
                "new",
                "processing",
                "approved",
                "disbursed",
                "overdue",
                "fully_paid",
                "closed",
                "ready_for_disbursement",
            ],
            default: "processing",
        },
        repayment_plan: {
            monthly_payment: {
                type: Number,
            },
            total_payment: {
                type: Number,
            },
        },
        repayments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Repayment",
            },
        ],
        processing_fee: {
            type: Number, //1% of the loan_amount (principal)
        },
        createdByType: {
            type: String,
            enum: ['User', 'Staff'],
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'createdByType',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("LoanApplication", LoanApplication);