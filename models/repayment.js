const mongoose = require("mongoose");
const LoanApplication = require("./loanApplication");

const Repayment = new mongoose.Schema({
    loan_application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoanApplication",
        required: true,
    },
    due_date: {
        type: Date,
    },
    repayment_id: {
        type: Number,
    },
    due_amount: {
        type: Number,
    },
    due_principal: {
        type: Number,
    },
    due_interest: {
        type: Number,
    },
    amount_paid: {
        type: Number,
    },
    date_logged: {
        type: Date,
    },
    balance_to_pay: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["",""],
        default: "",
    },
});

module.exports = mongoose.model("Repayment", Repayment);