const kyc = require("../models/kyc");
const User = require("../models/user");

module.exports = class UserService {
    static async createUser(data){
        try {
            const newUser = {
                first_name: data.first_name,
                last_name: data.last_name,
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
            const user = await User.findOne({ email: email }).populate('kyc_verification');
            return user;
        } catch (error) {
            return error;
        }
    }

    static async getUserByID(id){
        try {
            const user = await User.findById(id).populate('kyc_verification');
            return user;
        } catch (error) {
            return error;
        }
    }

    static async getUsers(){
        try {
            const users = await User.find().populate('kyc_verification');
            return users;
        } catch (error) {
            return error;
        }
    }

    static async validateOTP(userId, inputOTP) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return { success: false, message: "User not found." };
            }

            await user.clearOTPIfExpired();

            if (user.otp === "EXPIRED") {
                return { success: false, message: "OTP has expired." };
            }

            if (user.otp === inputOTP) {
                user.otp = "EXPIRED";
                // user.otpCreatedAt = null;
                await user.save();
                return { success: true, message: "OTP validated successfully.", User: user};
            } else {
                return { success: false, message: "Invalid OTP." };
            }
        } catch (error) {
            console.error("Error validating OTP:", error);
            return { success: false, message: "An unexpected error occurred during OTP validation." };
        }
    }

    //update the OTP for a user
    static async updateOTP(email, otp) {
        try {
            const updateUser = await User.findOneAndUpdate(
                { email: email },
                { otp: otp, otpCreatedAt: Date.now() },
                { new: true }
            );
            if (!updateUser) {
                throw new Error("User not found.");
            }
            return updateUser;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    static async resetPassword(email, otp, new_password) {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return { success: false, message: "User not found." };
            }

            if (user.otp !== otp || user.otpExpired || user.isOTPExpired()) {
                return { success: false, message: "Invalid or expired OTP." };
            }

            user.otpExpired = true;
            user.otp = null;
            user.otpCreatedAt = null;

            user.password = new_password;
            await user.save();

            return { success: true, message: "Password reset successfully." };
        } catch (error) {
            console.error("Error resetting password:", error);
            return { success: false, message: "An error occurred while resetting the password.", error };
        }
    }
};

