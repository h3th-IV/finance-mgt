const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");


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
            let OTP = "";
            for(let i=0; i<5; i++) {
                OTP += characters[Math.floor(Math.random() * 6)];
            }
            const user = {
                name,
                email,
                number,
                password,
            };
        } catch (error) {
            
        } 
    }
};