const mongoose = require("mongoose");
const User = require("./user");

const OTP = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 //approx 5 minutes
    }
});

module.exports = mongoose.model("OTP", OTP);