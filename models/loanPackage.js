const mongoose = require("mongoose");
const Staff = require("./staff")

const LoanPackage = new mongoose.Schema({
    name: {
        type: String,
    },
    min_amount: {
        type: String,
    },
    max_Amount: {
        type: String,
    },
    interest_rate: {
        type: String,
    },
    createBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true,
    },
});

module.exports = mongoose.model("LoanPackage", LoanPackage);