const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
        unique: true,
    },
    bank: {
        type: String,
        required: true,
    },
    bank_code: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'not-active'],
        default: 'active',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('BankDetails', bankDetailsSchema);
