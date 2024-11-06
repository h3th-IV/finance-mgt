const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");

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
            const user_exist = UserService.getUserByEmail(lower_email);
            if (!user_exist){
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
                email,
                number,
                password,
                otp
            };
            const response = await UserService.createUser(user);
            if (response?.errors){
                return errorResponse(res, 500, "An error occurred", response);
            }
            mailer.sendOTPEmail(email, first_name, otp);
            return successResponse(res, 201, "User created successfully, OTP sent to email", response);
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
            const response = UserService.validateOTP(userId, inputOTP);
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