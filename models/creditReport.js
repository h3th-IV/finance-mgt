const { string } = require("joi");
const mongoose = require("mongoose");

const CreditReportSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    report: {
        type: Array,    
    },
    pdf_report: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("CreditReport", CreditReportSchema);
