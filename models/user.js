const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone_number: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: false,
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    address: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
        unique: true,
    },
    otpCreatedAt: {
        type: Date,
        default: Date.now,
    }
}, {timestamps: true,});

UserSchema.methods.isOTPExpired = function (){
    const otpExpirationTime = 5 * 60 * 1000;
    return Date.now() > this.otpCreatedAt.getTime() + otpExpirationTime;
};

UserSchema.methods.clearOTPIfExpired = async function(){    
    if (this.isOTPExpired()) {
        this.otp = "EXPIRED";
        this.otpCreatedAt = null;
        await this.save();
    }
}

UserSchema.methods.regenerateOTP = async function () {
  if (this.isOTPExpired()) {
    const characters = "0123456789";
    let newOTP = "";
    for (let i = 0; i < 5; i++) {
      newOTP += characters[Math.floor(Math.random() * 10)];
    }
    this.otp = newOTP;
    this.otpCreatedAt = Date.now();
    await this.save();
    return newOTP;
  }
  return null;
};

UserSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); 
});

UserSchema.methods.getSignedJwtToken = function(){
  return jwt.sign({
    id: this._id,
    email: this.email
  },
 
  "thugnificient@lethalinterjections.com",
  {
    expiresIn: "30d",
  })
}

module.exports = mongoose.model("User", UserSchema);