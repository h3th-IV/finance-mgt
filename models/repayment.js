const mongoose = require("mongoose");


const Repayment = new mongoose.Schema({
    repayment_id: {
        type: String,
    },
    principal: {
        type: Number,
    },
    remaining_principal: {
        type: Number
    },
    interest: {
        type: Number
    },
    amount: {
        type: Number,
    },
    amount_paid:{
        type: Number,
    },
    due_date: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    }
}, { timestamps: true });

module.exports = mongoose.model("Repayment", Repayment);