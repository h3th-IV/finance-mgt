const mongoose = require("mongoose");
const User = require("./user");

const employmentInformation = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    employmentType: {
        type: String,
        required: true,
    },
    monthlyIncome: {
        type: String,
        required: true,
    },
    employerAddress: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("EmploymentInformation", employmentInformation);