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
        ref: "User",
        required: true,
    }
}, {timestamps: true,});

module.exports = mongoose.model("LoanProduct", LoanProduct);