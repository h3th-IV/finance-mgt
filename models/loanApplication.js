const mongoose = require("mongoose");
const User = require("./user");
const LoanPackage = require("./loanPackage");
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
    loan_package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoanPackage",
        required: true,
    },
    interest_rate: {
        type: Number,
    },
    loan_duration: {
        type: Number,
    },
    no_of_repayments: {
        type: Number,
    },
    statement_of_account: {
        type: String,
    },
    date_disbursed: {
        type: Date,
    },
    maturity_date: {
        type: Date,
    },
    overdue_accruals: {
        type: Number,
    },
    relationship_officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true,
    },
    credit_score: {
        type: Number,
    },
    first_approval: {
        type: String,
    },
    second_approval: {
        type: String,
    },
    third_approval: {
        type: String,
    },
    fourth_approval: {
        type: String,
    }
});

module.exports = mongoose.model("LoanApplication", LoanApplication)