const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema({
    bank_verification_number: {
        bvn: {
            type: String,
        },
        dob: {
            type: Date,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    facial_verification: {
        pic: {
            type: String,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    document_verification: {
        doc_type: {
            type: String,
            enum: ["NIN", "INTL_PASSPORT", "DRIVERS_LICENSE"],
        },
        doc_no: {
            type: String,
        },
        doc: {
            type: String,
        },
        home_address: {
            type: String,
        },
        status: {
            type: Boolean,
            default: false,
        },
    }
}, { timestamps: true });

module.exports = mongoose.model("KYC", KYCSchema);
