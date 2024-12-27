const mongoose = require('mongoose');

const LoanProduct = new mongoose.Schema({
    name: {
        type: String,
    },
    desc: {
        type: String,
    },
    interest: {
        type: Number,
    },
    max: {
        type: Number,
    },
    min: {
        type: Number,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active",
    },
    interest_type: {
        type: String,
        enum: ["flat_rate", "reducing_balance"]
    },
    duration: {
        type: [Number], //a list of numbers csv
        required: true,
    }
}, {timestamps: true,});

module.exports = mongoose.model("LoanProduct", LoanProduct);