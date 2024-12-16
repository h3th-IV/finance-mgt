const mongoose = require('mongoose');
const { generateOTP } = require('../helpers/otp');

const KYCSchema = new mongoose.Schema({
    email: {
        address: {
            type: String,
            unique: true,
        },
        otp: {
            type: String,
        },
        otpCreatedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    bank_verification_number: {
        bvn: {
            type: String,
        },
        dob: {
            type: Date,
        },
        otp: {
            type: String
        },
        otpCreatedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    utility_bill: {
        doc: {
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


KYCSchema.methods.isOTPExpired = function(){
    const otpExpirationTime = 5 * 60 * 1000;
    return Date.now() > this.otpCreatedAt.getTime() + otpExpirationTime;
}

KYCSchema.methods.clearOTPIfExpired = async function(){
    if (this.isOTPExpired()){
        this.otp = "EXPIRED";
        await this.save();
    }
};

KYCSchema.methods.regenerateOTP = async function(){
    if(this.isOTPExpired()){
        let newOTP = generateOTP()
        this.otp = newOTP;
        this.otpCreatedAt = Date.now();
        await this.save();
        return newOTP;
    }
    return null;
}

module.exports = mongoose.model("KYC", KYCSchema);
