const nodemailer = require("nodemailer");

const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mailto:ojobabajide629@gmail.com",
        pass: "cbab fkou ppva fhxc",
    },
});

module.exports.sendOTPEmail = (email, first_name, OTP) => {
    sender.sendMail({
        from: "Capitalwise Dynamic Pay",
        to: email,
        subject: "OTP for Account Verification",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f8f8;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    border-top: 10px solid #7AC143;
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #7AC143;
                    font-size: 24px;
                    margin: 0;
                }
                .content {
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    margin: 10px 0;
                }
                .otp {
                    display: inline-block;
                    background-color: #7AC143;
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: bold;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Capitalwise Dynamic Pay</h1>
                </div>
                <div class="content">
                    <p>Hi ${first_name},</p>
                    <p>Thank you for registering on our platform. Use the OTP below to verify your account:</p>
                    <div class="otp">${OTP}</div>
                    <p>This OTP is valid for a limited time only.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                </div>
            </div>
        </body>
        </html>
        `
    });
};


module.exports.sendForgotPassword = (email, otp) => {
    sender.sendMail({
        from: "Capitalwise Dynamic Pay",
        to: email,
        subject: "Password Reset Request",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f8f8f8;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        border-top: 10px solid #7AC143;
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #7AC143;
                        font-size: 24px;
                        margin: 0;
                    }
                    .content {
                        text-align: center;
                    }
                    .content p {
                        font-size: 16px;
                        margin: 10px 0;
                    }
                    .otp {
                        display: inline-block;
                        background-color: #7AC143;
                        color: #ffffff;
                        font-size: 24px;
                        font-weight: bold;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 14px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Capitalwise Dynamic Pay</h1>
                    </div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                        <div class="otp">${otp}</div>
                        <p>This OTP is valid for a limited time only.</p>
                        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                    </div>
                </div>
            </body>
            </html>
        `
    });
};

module.exports.sendLoginOTPEmail = (email, first_name, lastLogin, OTP) => {
    sender.sendMail({
        from: "Capitalwise Dynamic Pay",
        to: email,
        subject: "OTP for Secure Login",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f8f8;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    border-top: 10px solid #7AC143;
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #7AC143;
                    font-size: 24px;
                    margin: 0;
                }
                .content {
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    margin: 10px 0;
                }
                .otp {
                    display: inline-block;
                    background-color: #7AC143;
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: bold;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Capitalwise Dynamic Pay</h1>
                </div>
                <div class="content">
                    <p>Hi ${first_name},</p>
                    <p>We noticed that your last login was on <strong>${new Date(lastLogin).toLocaleString()}</strong>. Since it has been more than 24 hours, please use the OTP below to confirm your identity and continue logging in:</p>
                    <div class="otp">${OTP}</div>
                    <p>This OTP is valid for a limited time only.</p>
                    <p>If you did not initiate this login attempt, please ignore this email or contact our support team immediately.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                </div>
            </div>
        </body>
        </html>
        `
    });
};

module.exports.sendStaffOTPEmail = (email, first_name, OTP, role_name, staffId) => {
    const magicLink = `https://capitalwise.com/api/v1/admin/verify?staffId=${staffId}&otp=${OTP}`; //will update this

    sender.sendMail({
        from: "Capitalwise Dynamic Pay",
        to: email,
        subject: "Welcome to the Team - Complete Your Onboarding",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f8f8;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    border-top: 10px solid #7AC143;
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #7AC143;
                    font-size: 24px;
                    margin: 0;
                }
                .content {
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    margin: 10px 0;
                }
                .otp {
                    display: inline-block;
                    background-color: #7AC143;
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: bold;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                    color: #666;
                }
                .btn {
                    display: inline-block;
                    padding: 12px 25px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #7AC143;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Capitalwise Dynamic Pay</h1>
                </div>
                <div class="content">
                    <p>Hi ${first_name},</p>
                    <p>You've been onboarded as a staff member with the role of <strong>${role_name}</strong>.</p>
                    <p>Use the OTP below to complete your onboarding:</p>
                    <div class="otp">${OTP}</div>
                    <p>Alternatively, click the link below to set your password directly:</p>
                    <a href="${magicLink}" class="btn">Complete Onboarding</a>
                    <p>This OTP is valid for a limited time only.</p>
                    <p>If you did not expect this email, please contact our support team.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                </div>
            </div>
        </body>
        </html>
        `,
    });
};

module.exports.sendGuarantorMail = (email, name, customerName, loanDetails) => {
    sender.sendMail({
        from: "Capitalwise Dynamic Pay",
        to: email,
        subject: "Guarantor Request for Loan Application",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f8f8f8;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        border-top: 10px solid #7AC143;
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #7AC143;
                        font-size: 24px;
                        margin: 0;
                    }
                    .content {
                        text-align: center;
                    }
                    .content p {
                        font-size: 16px;
                        margin: 10px 0;
                    }
                    .loan-details {
                        margin-top: 20px;
                        padding: 10px;
                        background-color: #f0f0f0;
                        border-radius: 8px;
                        font-size: 16px;
                        text-align: left;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 14px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Capitalwise Dynamic Pay</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${name},</p>
                        <p>${customerName} has listed you as a guarantor for their loan application. Below are the loan details:</p>
                        <div class="loan-details">
                            <p><strong>Loan Product:</strong> ${loanDetails.loanProduct}</p>
                            <p><strong>Loan Amount:</strong> ${loanDetails.loanAmount}</p>
                            <p><strong>Loan Duration:</strong> ${loanDetails.loanDuration} months</p>
                        </div>
                        <p>If you agree to be the guarantor, please respond to this email or contact us for further steps.</p>
                        <p>If this was not requested by you, kindly ignore this email.</p>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                    </div>
                </div>
            </body>
            </html>
        `
    });
};


module.exports.sendUpdatePasswordOTP = (email, first_name, OTP) => {
    sender.sendMail({
        from: "Capitalwise Dynamic Pay",
        to: email,
        subject: "OTP for Password Update",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f8f8;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    border-top: 10px solid #7AC143;
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #7AC143;
                    font-size: 24px;
                    margin: 0;
                }
                .content {
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    margin: 10px 0;
                }
                .otp {
                    display: inline-block;
                    background-color: #7AC143;
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: bold;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Capitalwise Dynamic Pay</h1>
                </div>
                <div class="content">
                    <p>Hi ${first_name},</p>
                    <p>You made a request to update your password. Use the OTP below to update your password:</p>
                    <div class="otp">${OTP}</div>
                    <p>This OTP is valid for a limited time only.</p>
                    <p>If you did not request this OTP, please ignore this email and contact our support team immediately.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                </div>
            </div>
        </body>
        </html>
        `
    });
};