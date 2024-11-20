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
            type: String, //document Upload
        },
        passport_form: {
            type: String, //document Upload
        },
        statement_of_net_worth: {
            type: String, //document Upload
        },
        security_cheque: {
            type: String, //document Upload
        },
    },
    date_disbursed: {
        type: Date,
    },
}, {timestamps: true,});

module.exports = mongoose.model("LoanApplication", LoanApplication)