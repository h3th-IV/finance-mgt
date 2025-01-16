const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const KYC = require('./kyc');
const { generateOTP} = require('../helpers/otp');

const UsersSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: function() { return this.accountType === 'individual'; }
    },
    last_name: {
        type: String,
        required: function() { return this.accountType === 'individual'; }
    },
    email: {
        type: String,
        required: false,
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // required: true,
    },
    profilePicture: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
        unique: false,
    },
    otpCreatedAt: {
        type: Date,
        default: Date.now,
    },
    last_login: {
      type: Date,
      default: Date.now,
    },
    kyc_verification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KYC",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ['individual', 'business'],
      required: true,
      default: 'individual'
    },
    business_name: {
      type: String,
      required: function() { return this.accountType === 'business'; }
    },
    kyc_business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessKYC'
    }
}, {timestamps: true});

UsersSchema.methods.isOTPExpired = function () {
  const otpExpirationTime = 5 * 60 * 1000; // 5 minutes
  return Date.now() > this.otpCreatedAt.getTime() + otpExpirationTime;
};

UsersSchema.methods.clearOTPIfExpired = async function () {
  if (this.isOTPExpired()) {
    this.otp = "EXPIRED";
    await this.save();
  }
};

UsersSchema.methods.regenerateOTP = async function () {
  if (this.isOTPExpired()) {
    let newOTP = generateOTP();
    this.otp = newOTP;
    this.otpCreatedAt = Date.now();
    await this.save();
    return newOTP;
  }
  return null;
};

UsersSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); //avoid rehashing an already hashed password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UsersSchema.methods.getSignedJwtToken = function(){
  return jwt.sign({
    id: this._id,
    email: this.email,
    accountType: this.accountType,
  },
    "thugnificient@lethalinterjections.com",
  {
    expiresIn: "30d",
  })
};

module.exports = mongoose.model("User", UsersSchema);
