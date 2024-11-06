const nodemailer = require("nodemailer");

const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "",
        pass: "",
    },
});

module.exports.sendOTPEmail = (email, first_name, OTP) => {};