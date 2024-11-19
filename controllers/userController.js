const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");
const bcryptjs = require("bcryptjs");
const KYC = require("../models/kyc");
const User = require("../models/user")

module.exports = class UserController {
    static async createUser(req, res) {
        const { first_name, last_name, email, number, password } = req.body;
        try {
            if (!first_name || first_name === ""){
                return errorResponse(res, 400, "Please provide your first_name");
            }
            if (!last_name || last_name === ""){
                return errorResponse(res, 400, "Please provide your last_name");
            }
            if (!email || email === ""){
                return errorResponse(res, 400, "Please provide your email address");
            }
            const emailValid = validateEmail(email);
            if (!emailValid.success) {
                return errorResponse(res, 400, emailValid.message);
            }
            if (!number || number === ""){
                return errorResponse(res, 400, "Please provide your phone number");
            }
            if (!password || password === ""){
                return errorResponse(res, 400, "Please provide a strong password");
            }
            if (password.length < 9){
                return errorResponse(res, 400, "Please provide a longer password")
            }
            const specialChars = /[!@#$%^&*()_+:"{}[\]\\|<>,.?/~`']/g;
            if (!specialChars.test(password)){
                return errorResponse(res, 400, "Password must include at least one(1) special character");
            }
            const lower_email = email.toLowerCase();
            const user_exist = await UserService.getUserByEmail(lower_email);
            if (user_exist){
                return errorResponse(res, 400, "User with this email already exist");
            }
            const otp = generateOTP()
            const user = {
                first_name,
                last_name,
                email: lower_email,
                number,
                password,
                otp
            };
            const response = await UserService.createUser(user);
            if (response?.errors){
                return errorResponse(res, 500, "An error occurred", response);
            }
            mailer.sendOTPEmail(email, first_name, otp);
            return successResponse(res, 201, "User created successfully, please check your email for OTP verification", response);
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        } 
    }

    static async validateOTP(req, res){
        const userId = req.params.userId;
        const { inputOTP } = req.body;
        if (!userId) {
            return errorResponse(res, 400, "Missing user ID");
        }
        if (!inputOTP || inputOTP === ""){
            return errorResponse(res, 400, "Please provide the OTP");
        }
        try {
            const responseOTP = await UserService.validateOTP(userId, inputOTP);
            const user = responseOTP.User;
            if (responseOTP.success) {
                const token = user.getSignedJwtToken();
                const response = {
                    jwToken: token,
                    name: user.first_name,
                    email: user.email,
                    phone: user.phone_number,
                    message: "OTP validated successfully"
                }
                return successResponse(res, 200, response);
            } else {
                return errorResponse(res, 400, responseOTP.message);
            }
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }

    static async regenerateOTP(req, res) {
        const userId = req.params.userId;
        try {
            const user = await UserService.getUserByID(userId);
            if (!user) {
                return errorResponse(res, 404, "User not found");
            }
            const newOTP = await user.regenerateOTP();
            if (newOTP) {
                mailer.sendOTPEmail(user.email, user.first_name, newOTP);
                return successResponse(res, 200, "A new OTP has been sent to your email");
            } else {
                return errorResponse(res, 400, "OTP is still valid. Please try again later");
            }
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An error occurred while regenerating the OTP", error);
        }
    }

    static async login(req, res){
        const { email, password } = req.body;
        try {
            if (!email || email === ""){
            return errorResponse(res, 400, "Email not provided")
        }
        const emailValid = validateEmail(email);
        if (!emailValid.success) {
            return errorResponse(res, 400, emailValid.message);
        }
        if (!password || password === ""){
            return errorResponse(res, 400, "Password not provided")
        }
        const lower_email = email.toLowerCase();
        // console.log(lower_email);
        const user = await UserService.getUserByEmail(lower_email);
        if (!user){
            return errorResponse(res, 401, "User with email not found");
        }
        // console.log("usr: ", user)
        const isPassword = await bcryptjs.compare(password, user.password);
        if (!isPassword){
            return errorResponse(res, 401, "Incorrect password");
        }
        // const loginExp = 24 * 60 * 60 * 1000;
        // if (Date.now() - user.last_login.getTime() > loginExp) {
        //     const otp = generateOTP();
        //     user.otp = otp;
        //     user.otpCreatedAt = Date.now();
        //     await user.save();
        //     mailer.sendLoginOTPEmail(email, user.first_name, user.last_login, otp);
        //     return successResponse(res, 200, "OTP sent to your email. Please verify before logging in.", user);
        // }
        const token = user.getSignedJwtToken();
        if (!user.is_verified) {
            const response = {
                user,
                jwToken: token,
            }
        return successResponse(res, 200, "Please complete your KYC verification to continue.", response);
        }
        // user.last_login = Date.now();
        // await user.save();
        const response = {
            jwToken: token,
            user: user,
        }
        return successResponse(res, 200, "Login successful", response);
        } catch (error) {
            console.log("err", error);
            return errorResponse(res, 500, "Server Error");
        }
    }

    static async getAllUsers(req, res){
        try {
            const response = await UserService.getUsers();
            return successResponse(res, 200, "Users returned successfully", response);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }

    static async forgotPasswordOTP(req, res){
        const { email } = req.body;
        const otp = generateOTP()
        try {
            const response = await UserService.updateOTP(email, otp);
            mailer.sendForgotPassword(email, otp);
            return successResponse(res, 200, "Password reset email sent!");
        } catch (error) {
            return errorResponse(res, 500, "Unable to send password reset email");
        }
    }

    //TODO: check if otp is expired
    static async resetPassword(req, res) {
        const { email, otp, new_password } = req.body;
        if (!email || !otp || !new_password) {
            return errorResponse(res, 400, "All fields (email, otp, and new password) are required.");
        }
        
        try {
            const response = await UserService.resetPassword(email, otp, new_password);
            if (response.success) {
                return successResponse(res, 200, response.message);
            } else {
                return errorResponse(res, 400, response.message);
            }
        } catch (error) {
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }

    static async updateKYC(req, res) {
        const { userId } = req.params;
        const kycData = req.body;

        try {
            //fetch the user and their associated KYC record
            let user = await User.findById(userId).populate('kyc_verification');
            if (!user) {
                return errorResponse(res, 404, "User not found");
            }

            //fetch existing KYC record if it exists
            let kycRecord = user.kyc_verification
                ? await KYC.findById(user.kyc_verification._id)
                : null;

            //prep updated data, combine existing and incoming data
            const updateData = {
                ...kycData,
                'facial_verification.pic': req.files['facial_verification.pic']
                    ? req.files['facial_verification.pic'][0].path
                    : kycRecord?.facial_verification?.pic,
                'document_verification.doc': req.files['document_verification.doc']
                    ? req.files['document_verification.doc'][0].path
                    : kycRecord?.document_verification?.doc,
            };

            //update or create the KYC record
            if (kycRecord) {
                kycRecord = await KYC.findByIdAndUpdate(
                    kycRecord._id,
                    updateData,
                    { new: true, runValidators: true }
                );
            } else {
                kycRecord = new KYC(updateData);
                await kycRecord.save();
                user.kyc_verification = kycRecord._id;
            }

            //update statuses based on existing and new data
            const bankVerified =
                Boolean(kycData['bank_verification_number.bvn'] || kycRecord.bank_verification_number?.bvn) &&
                Boolean(kycData['bank_verification_number.dob'] || kycRecord.bank_verification_number?.dob);
            const facialVerified =
                Boolean(req.files['facial_verification.pic'] || kycRecord.facial_verification?.pic);
            const documentVerified =
                Boolean(kycData['document_verification.doc_type'] || kycRecord.document_verification?.doc_type) &&
                Boolean(kycData['document_verification.doc_no'] || kycRecord.document_verification?.doc_no) &&
                Boolean(req.files['document_verification.doc'] || kycRecord.document_verification?.doc) &&
                Boolean(kycData['document_verification.home_address'] || kycRecord.document_verification?.home_address);

            //update the KYC record with statuses
            kycRecord.bank_verification_number.status = bankVerified;
            kycRecord.facial_verification.status = facialVerified;
            kycRecord.document_verification.status = documentVerified;
            await kycRecord.save();

            //update the user's overall verification status
            const isVerified =
                kycRecord.bank_verification_number.status &&
                kycRecord.facial_verification.status &&
                kycRecord.document_verification.status;
            user.is_verified = isVerified;

            await user.save();

            return successResponse(res, 200, "KYC information updated successfully", {
                is_verified: user.is_verified,
                kyc: kycRecord,
            });
        } catch (error) {
            console.error("Error updating KYC:", error);
            return errorResponse(res, 500, "Server error");
        }
    }


};

function validateEmail(email) {
    const lower_email = email.toLowerCase();
    const valid_email = lower_email.split("@");
    //contains @ or domain part?
    if (valid_email.length < 2 || !valid_email[1].includes(".")) {
        return { success: false, message: "Email is not valid" };
    }
    return { success: true };
}

function generateOTP(){
    const characters = "0123456789";
    let otp = "";
    for(let i=0; i<5; i++) {
        otp += characters[Math.floor(Math.random() * 6)];
    }
    return otp;
}