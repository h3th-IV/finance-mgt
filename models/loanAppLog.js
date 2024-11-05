const mongoose = require("mongoose");
const LoanApplication = require("./loanApplication");
const Staff = require("./staff");

const LoanApplicationLogs = new mongoose.Schema({
    LoanApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoanApplication",
        required: true,
    },
    previous_value: {
        type: Object,
    },
    new_value: {
        type: Object,
    },
    action_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true,
    },
});

module.exports = mongoose.model("LoanApplicationLogs", LoanApplicationLogs);