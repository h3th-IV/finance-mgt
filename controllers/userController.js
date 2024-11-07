const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");
const bcryptjs = require("bcryptjs");

module.exports = class UserController {
    static async createUser(req, res) {
        const { name, email, number, password } = req.body;
        try {
            if (!name || name === ""){
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
            const characters = "0123456789";
            let otp = "";
            for(let i=0; i<5; i++) {
                otp += characters[Math.floor(Math.random() * 6)];
            }
            const first_name = name.split(" ")[0];
            const user = {
                name,
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
            return errorResponse(res, 500, "An unexpected error occurred", error);
        } 
    }

    static async validateOTP(req, res){
        const userId = req.params.userId;
        const { inputOTP } = req.body;
        if (!userId || !inputOTP) {
            return errorResponse(res, 400, "Missing user ID or OTP.");
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
