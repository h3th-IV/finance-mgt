const nodemailer = require("nodemailer");

const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mailto:ojobabajide629@gmail.com",
        pass: "cbab fkou ppva fhxc",
    },
});

module.exports.sendOTPEmail = (email, first_name, OTP) => {};