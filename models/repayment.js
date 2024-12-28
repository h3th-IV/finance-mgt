const mongoose = require("mongoose");
const LoanApplication = require("./loanApplication");

const Repayment = new mongoose.Schema({
    repayment_id: {
        type: String,
    },
    principal: {
        type: Number,
    },
    interest: {
        type: Number
    },
    amount: {
        type: Number,
    },
    due_date: {
        type: Date,
    },
});

module.exports = mongoose.model("Repayment", Repayment);