const User = require("../models/user");

module.exports = class UserService {
    static async createUser(data){
        try {
            const newUser = {
                full_name: data.name,
                email: data.email,
                phone_number: data.number,
                password: data.password,
                otp: data.otp
            }
            const response = await new User(newUser).save();
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getUserByEmail(email){
        try {
            const user = await User.findOne({ email: email });
            return user;
        } catch (error) {
            return error;
        }
    }

    static async getUserByID(_id){
        try {
            const user = await User.findById(_id);
            return user;
        } catch (error) {
            return error;
        }
    }

    static async getUsers(){
        try {
            const users = await User.find();
            return users;
        } catch (error) {
            return error;
        }
    }

    static async validateOTP(userId, inputOTP){
        try {
            const user = await User.findById(userId);
            if (!user) {
            return { success: false, message: "User not found." };
            }
            await user.clearOTPIfExpired();
            if (user.otp === "EXPIRED"){
                return { success: false, message: "OTP has expired." };
            }
            if(user.otp === inputOTP){
                user.otp = "EXPIRED";
                user.otpCreatedAt = null;
                await user.save();

                return { success: true, message: "OTP validated successfully."};
            } else{
                return { success: false, message: "Invalid OTP."};
            }
        } catch (error) {
            console.log(error);
            return { success: false, message: "An error occurred during OTP validation.", error };
        }
    }
};

