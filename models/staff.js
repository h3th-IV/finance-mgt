const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { generateOTP} = require('../helpers/otp');

const StaffSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    dob: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
    otp: {
        type: String,
        required: false,
    },
    otpCreatedAt: {
        type: Date,
        default: Date.now,
    },
    password: {
        type: String,
        required: false,
    },
}, { timestamps: true });


StaffSchema.methods.isOTPExpired = function () {
  const otpExpirationTime = 24 * 60 * 60 * 1000;//change dis -> 24hrs
  return Date.now() > this.otpCreatedAt.getTime() + otpExpirationTime;
};

StaffSchema.methods.clearOTPIfExpired = async function () {
  if (this.isOTPExpired()) {
    this.otp = "EXPIRED";
    await this.save();
  }
};

StaffSchema.methods.regenerateOTP = async function () {
  if (this.isOTPExpired()) {
    let newOTP = generateOTP()
    this.otp = newOTP;
    this.otpCreatedAt = Date.now();
    await this.save();
    return newOTP;
  }
  return null;
};

StaffSchema.methods.generateStaffToken = function () {
    return jwt.sign(
        {
            staffId: this._id,
            role: this.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

StaffSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("Staff", StaffSchema);
