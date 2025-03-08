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


module.exports.sendBusinessOTPEmail = (email, OTP) => {
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
                    <p>Dear Valued Partner,</p>
                    <p>Thank you for choosing our platform. Use the OTP below to verify your account:</p>
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
    const magicLink = `https://capitalwise-fe.onrender.com/admin/staff-onboarding?staffId=${staffId}&otp=${OTP}`; //will update this

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

module.exports.sendGuarantorMail = (email, name, customerName, loanDetails, loanApplicationId) => {
    const guarantorFormLink = `https://capitalwise-fe.onrender.com/guarantor-form/${loanApplicationId}`;

    sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
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
                    .btn {
                        display: inline-block;
                        padding: 12px 25px;
                        margin-top: 20px;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #7AC143;
                        text-decoration: none;
                        border-radius: 5px;
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
                        <p>If you agree to be the guarantor, please click the button below to fill out your details:</p>
                        <a href="${guarantorFormLink}" class="btn">Fill Guarantor Details</a>
                        <p>Alternatively, you can copy and paste the following link into your browser:</p>
                        <p><a href="${guarantorFormLink}">${guarantorFormLink}</a></p>
                        <p>If you have any questions or need further assistance, please contact our support team at support@capitalwisedynamicpay.com.</p>
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


module.exports.sendApprovalRequestEmail = async (assigneeEmail, assigneeName, requesterName, approvalAction, loanApplicationId) => {
    const magicLink = `https://capitalwise-fe.onrender.com/approvals/${loanApplicationId}`; //will update this link

    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: assigneeEmail,
        subject: "Action Required: Approval Request Assigned to You",
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
                    <p>Dear ${assigneeName},</p>
                    <p>An approval request has been assigned to you by ${requesterName}.</p>
                    <p>You are required to review and approve the following action:</p>
                    <strong>${approvalAction}</strong>
                    <p>This request pertains to a loan application with ID: <strong>${loanApplicationId}</strong>.</p>
                    <p>Please click the button below to access the approval request and take the necessary action:</p>
                    <a href="${magicLink}" class="btn">Review and Approve</a>
                    <p>If you have any questions or require additional information, please contact the requesting staff member directly.</p>
                    <p>This request is time-sensitive, and your prompt attention is appreciated.</p>
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

module.exports.sendApprovalApprovedEmail = async (requesterEmail, requesterName, approverName, approvalAction, loanApplicationId) => {
    const magicLink = `https://capitalwise-fe.onrender.com/admin/loan-application/${loanApplicationId}`; //will update this

    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: requesterEmail,
        subject: "Your Approval Request Has Been Approved",
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
                    <p>Dear ${requesterName},</p>
                    <p>We are pleased to inform you that your approval request for the following action has been successfully approved:</p>
                    <strong>${approvalAction}</strong>
                    <p>This approval pertains to the loan application with ID: <strong>${loanApplicationId}</strong>.</p>
                    <p>The approval was granted by <strong>${approverName}</strong>.</p>
                    <p>You can view the updated status of the loan application by clicking the button below:</p>
                    <a href="${magicLink}" class="btn">View Loan Application</a>
                    <p>If you have any questions or require further information, please contact our support team.</p>
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

module.exports.sendApprovalDeclinedEmail = async (requesterEmail, requesterName, approverName, approvalAction, loanApplicationId, declineNote) => {
    const magicLink = `https://capitalwise-fe.onrender.com/loanapp/get-single-loan/${loanApplicationId}`; //update the link

    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: requesterEmail,
        subject: "Your Approval Request Has Been Declined",
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
                    border-top: 10px solid #FF6347; /* Tomato red */
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #FF6347;
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
                .btn {
                    display: inline-block;
                    padding: 12px 25px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #FF6347;
                    text-decoration: none;
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
                    <p>Dear ${requesterName},</p>
                    <p>We regret to inform you that your approval request for the following action has been declined:</p>
                    <strong>${approvalAction}</strong>
                    <p>This approval pertains to the loan application with ID: <strong>${loanApplicationId}</strong>.</p>
                    <p>The approval was reviewed by <strong>${approverName}</strong>, and the decision was made to decline it.</p>
                    <p>Reason for declination:</p>
                    <blockquote style="border-left: 4px solid #FF6347; padding-left: 10px; color: #666;">
                        ${declineNote}
                    </blockquote>
                    <p>You can view the updated status of the loan application by clicking the button below:</p>
                    <a href="${magicLink}" class="btn">View Loan Application</a>
                    <p>If you have any questions or require further information, please contact our support team.</p>
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


module.exports.sendDisbursementEmail = async (customerEmail, customerName, loanAmount, loanDuration, loanProductName, loanApplicationId) => {
    const magicLink = `https://capitalwise-fe.onrender.com/loanapp/get-single-loan/${loanApplicationId}`; // Update the link dynamically

    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: customerEmail,
        subject: "Your Loan Has Been Successfully Disbursed",
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
                    border-top: 10px solid #32CD32; /* Lime green */
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #32CD32;
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
                .btn {
                    display: inline-block;
                    padding: 12px 25px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #32CD32;
                    text-decoration: none;
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
                    <p>Dear ${customerName},</p>
                    <p>We are pleased to inform you that your loan application has been successfully disbursed.</p>
                    <p><strong>Loan Details:</strong></p>
                    <ul style="list-style-type: none; padding: 0; text-align: left;">
                        <li><strong>Loan Product:</strong> ${loanProductName}</li>
                        <li><strong>Loan Amount:</strong> $${loanAmount.toFixed(2)}</li>
                        <li><strong>Loan Duration:</strong> ${loanDuration} month(s)</li>
                    </ul>
                    <p>The funds have been transferred to the bank account associated with your account. Please ensure that the account details provided are correct.</p>
                    <p>Your repayment schedule is available in your account dashboard. Your first repayment is due 30 days from the disbursement date.</p>
                    <p>You can view your loan details by clicking the button below:</p>
                    <a href="${magicLink}" class="btn">View Loan Details</a>
                    <p>If you have any questions or need further assistance, please contact our support team at support@capitalwisedynamicpay.com.</p>
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

module.exports.sendCommentAddedEmail = async (requesterEmail, requesterName, commenterName,  comment,loanApplicationId,) => {
    const magicLink = `https://capitalwise-fe.onrender.com/admin/loan-application/${loanApplicationId}`; // Updated for loanApplicationId

    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: requesterEmail,
        subject: "A New Comment Has Been Added to Your Loan Application",
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
                    <p>Dear ${requesterName},</p>
                    <p>We wanted to notify you that a new comment has been added to your loan application:</p>
                    <p><strong>Comment: </strong>${comment}</p>
                    <p>This comment was added by <strong>${commenterName}</strong>.</p>
                    <p>You can view the updated status of the loan application by clicking the button below:</p>
                    <a href="${magicLink}" class="btn">View Loan Application</a>
                    <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
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



module.exports.sendOfferLetterNotificationEmail = async (staffEmail, loanApplicationId, customerName, loanProductName) => {
    const magicLink = `https://capitalwise-fe.onrender.com/loanapp/get-single-loan/${loanApplicationId}`;

    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: staffEmail,
        subject: "Loan Offer Letter Submitted for Disbursement",
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
                    border-top: 10px solid #32CD32; /* Lime green */
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #32CD32;
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
                .btn {
                    display: inline-block;
                    padding: 12px 25px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #32CD32;
                    text-decoration: none;
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
                    <p>Dear Staff,</p>
                    <p>An offer letter has been submitted and reviewed for the following loan application:</p>
                    <ul style="list-style-type: none; padding: 0; text-align: left;">
                        <li><strong>Customer Name:</strong> ${customerName}</li>
                        <li><strong>Loan Product:</strong> ${loanProductName}</li>
                        <li><strong>Loan ID:</strong> ${loanApplicationId}</li>
                    </ul>
                    <p>The loan is now ready for disbursement. Please review the loan application and proceed with disbursement upon satisfaction.</p>
                    <p>You can view the loan details by clicking the button below:</p>
                    <a href="${magicLink}" class="btn">Review Loan Application</a>
                    <p>If you have any questions or need further assistance, please contact our support team at support@capitalwisedynamicpay.com.</p>
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

module.exports.sendOfferLetter = async (email, name, loan_id, pdfBuffer) => {
    console.log({email, name, loan_id});
    
   
    await sender.sendMail({
        from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
        to: email,
        subject: "Your Loan Offer Letter is Ready",
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
                    border-top: 10px solid #32CD32; /* Lime green */
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #32CD32;
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
                .btn {
                    display: inline-block;
                    padding: 12px 25px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #32CD32;
                    text-decoration: none;
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
                    <p>Dear ${name},</p>
                    <p>We are pleased to inform you that your loan application with ID <strong>${loan_id}</strong> has been reviewed and an offer letter has been prepared for your review.</p>
                    <p>Please find the attached offer letter document for your reference. If you agree with the terms outlined in the offer letter, please proceed to sign and accept it through your account dashboard.</p>
                    <p>If you have any questions or need further clarification, please do not hesitate to contact our support team at support@capitalwisedynamicpay.com.</p>
                    <a href="https://capitalwise-fe.onrender.com/loanapp/dashboard" class="btn">View Your Dashboard</a>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Capitalwise Dynamic Pay Ltd
                </div>
            </div>
        </body>
        </html>
        `,
        // attachments: [
        //     {
        //         filename: `Offer-Letter-${loan_id}.pdf`,
        //         content: buffer,
        //         contentType: 'application/pdf'
        //     }
        // ]
    }).catch((err) => {
        console.error("Error sending offer letter email:", err);
    });
};


module.exports.sendRoleAssignmentEmail = async (
    assigneeEmail,
    assigneeName,
    requesterName,
    assignedRole,
    loanApplicationId,
    loan_id
  ) => {
    const magicLink = `https://capitalwise-fe.onrender.com/loanapp/get-single-loan/${loanApplicationId}`;
  
    await sender.sendMail({
      from: "Capitalwise Dynamic Pay <no-reply@capitalwisedynamicpay.com>",
      to: assigneeEmail,
      subject: `Assignment Notice: You've been assigned to review Loan Application ${loanApplicationId}`,
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
                        text-align: left;
                        padding: 0 20px;
                    }
                    .content p {
                        font-size: 16px;
                        margin: 10px 0;
                    }
                    .responsibilities {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        border: 1px solid #e2e8f0;
                        margin: 20px 0;
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
                        <p>Dear ${assigneeName},</p>
                        <p>You've been assigned the role of <strong>"${assignedRole}"</strong> for the following loan application:</p>
                        
                        <div class="responsibilities">
                            <strong>Loan Application ID:</strong> ${loan_id}<br>
                            <strong>Your Role:</strong> ${assignedRole}<br>
                            <strong>Responsibilities:</strong><br>
                            ${
                                assignedRole === "Relationship Manager"
                                ? "Onboard the customer and gather business requirements"
                                : assignedRole === "Accounts Department"
                                ? "Validate financial information and affordability checks"
                                : assignedRole === "Internal Control"
                                ? "Perform compliance checks and documentation review"
                                : assignedRole === "Risk Management"
                                ? "Conduct credit checks and risk assessment"
                                : "Final approval and offer letter generation"
                            }
                        </div>
            
                        <p>Please review the application details and take the necessary actions:</p>
                        <a href="${magicLink}" class="btn">Access Approval Dashboard</a>
                        
                        <p>If you have any questions, please contact ${requesterName} or reply to this email.</p>
                        <p>This request is time-sensitive, and your prompt attention is appreciated.</p>
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