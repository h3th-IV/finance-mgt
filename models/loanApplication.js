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
        type: String,
    },
    guarantor: {
        kyc_guarantor_form: {
            type: String,
        },
        passport_form: {
            type: String,
        },
        statement_of_net_worth: {
            type: String,
        },
        security_cheque: {
            type: String,
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
}, {timestamps: true,});

module.exports = mongoose.model("LoanApplication", LoanApplication)