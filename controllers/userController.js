const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");
const bcryptjs = require("bcryptjs");

module.exports = class UserController {
    static async createUser(req, res) {
        const { first_name, last_name, email, number, password } = req.body;
        try {
            if (!first_name || first_name === ""){
                return errorResponse(res, 400, "Please provide your full name");
            }
            if (!last_name || last_name === ""){
                return errorResponse(res, 400, "Please provide your full name");
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
            const response = await UserService.validateOTP(userId, inputOTP);
            if (response.success) {
                return successResponse(res, 200, response.message);
            } else {
                return errorResponse(res, 400, response.message);
            }
        } catch (error) {
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
                mailer.sendOTPEmail(user.email, user.full_name, newOTP);
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
        const user = await UserService.getUserByEmail(lower_email);
        if (!user){
            return errorResponse(res, 401, "User with email not found");
        }
        const isPassword = await bcryptjs.compare(password, user.password);
        if (!isPassword){
            return errorResponse(res, 401, "Incorrect password");
        }
        const token = user.getSignedJwtToken();
        const response = {
            jwToken: token,
            name: user.full_name,
            email: user.email,
            phone: user.phone_number,
        }
        return successResponse(res, 200, "Login successful", response);
        } catch (error) {
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