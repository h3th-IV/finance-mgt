const mongoose = require("mongoose");


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
            phone_number: {type: String, required: true},
        },
        guarantor2: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone_number: {type: String, required: true},
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
                "deleted"
            ],
            default: "processing",
        },
        repayment_plan: {
            monthlyPayment: {
                type: Number,
            },
            totalPayment: {
                type: Number,
            },
            totalInterest: {
                type: Number,
            },
            duration: {
                type: Number,
            },
            interestRate: {
                type: Number,
            },
            interestType: {
                type: String,
            }
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