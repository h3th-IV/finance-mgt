const mongoose = require("mongoose");
const User = require("./user");
const LoanProduct = require("./loanProduct");
const Staff = require("./staff");

const LoanApplication = new mongoose.Schema({
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
        type: String, //this is file that will be uploaded
    },
    guarantor: {
        kyc_guarantor_form: {
            type: String, //this a file too
        },
        passport_form: {
            type: String, //this a file too
        },
        statement_of_net_worth: {
            type: String, //this a file too
        },
        security_cheque: {
            type: String, //this a file too
        },
    },
    date_disbursed: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["approved", "processing", "declined"],
        default: "processing",
    },
    repayment_plan: {
        monthly_payment: {
                type: Number,
        },
        total_payment: {
            type: Number
        }
    },
    repayments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repayment",
        },
    ],
}, {timestamps: true,});

module.exports = mongoose.model("LoanApplication", LoanApplication)