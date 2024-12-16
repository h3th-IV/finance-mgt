const kyc = require("../models/kyc");
const User = require("../models/user");

module.exports = class UserService {
    static async createUser(data){
        try {
            const newUser = {
                first_name: data.first_name,
                last_name: data.last_name,
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

    static async getUserByPhone(number){
        try {
            const user = await User.findOne({ phone_number: number }).populate('kyc_verification');
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
            // await User.deleteMany();
            // await User.syncIndexes();
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

            if (user.otp !== otp || user.isOTPExpired()) {
                return { success: false, message: "Invalid or expired OTP." };
            }
            user.otp = "EXPIRED";
            // user.otpCreatedAt = null;

            user.password = new_password;
            await user.save();

            return { success: true, message: "Password reset successfully." };
        } catch (error) {
            console.error("Error resetting password:", error);
            return { success: false, message: "An error occurred while resetting the password.", error };
        }
    }

    static async kycOTPValidation(userId, inputOTP){
        try{
            const user = await User.findById(userId).populate('kyc_verification');
            if(!user){
                return { success: false, message: "User not found." };
            }
            const kyc = user.kyc_verification;
            if(!kyc || !kyc.email || !kyc.email.otp){
                return { success: false, message: "No kyc data found for this user"}
            }

            const { otp, otpCreatedAt } = kyc.email;

            if (otp !== inputOTP) {
                return { success: false, message: "Invalid OTP." };
            }
            const otpExpiryTime = 5 * 60 * 1000;
            const currentTime = Date.now();
            if (currentTime - new Date(otpCreatedAt).getTime() > otpExpiryTime) {
                return { success: false, message: "OTP has expired." };
            }
            kyc.email.otp = "EXPIRED";
            kyc.email.status = true;
            await kyc.save();
            return { success: true, message: "OTP validated successfully." };
        }catch (error){
            console.error("Error validating OTP: ", error);
            return{ success: false, message: "An unexpected error occurred during OTP validation." }
        }
    }

    static async updateKYCEmailOTP(userId, otp){
        try{
            const user = await User.findById(userId).populate('kyc_verification');
            if (!user){
                return { success: false, message: "User not found." };
            }
            const kyc = user.kyc_verification;
            if (!kyc) {
                return { success: false, message: "KYC details not found for this user." };
            }
            kyc.email.otp = otp;
            kyc.email.otpCreatedAt = Date.now();
            await kyc.save();
            return { success: true, message: "KYC email otp updated successfully" };
        }catch(error){
            console.error('Error: ', error);
            return { success: false, message: "An unexpected error occurred" }
        }
    }

    static async updateUserDetailsBVN(userId, data) {
        try {
            const user = await User.findById(userId).populate('kyc_verification');
            if (!user) {
                return { success: false, message: "User not found." };
            }

            const kyc = user.kyc_verification;
            if (!kyc) {
                return { success: false, message: "KYC details not found for this user." };
            }

            kyc.bank_verification_number.bvn = data.bvn;
            kyc.bank_verification_number.otp = data.otp;
            kyc.bank_verification_number.dob = data.dob;
            kyc.bank_verification_number.otpCreatedAt = Date.now();

            user.first_name = data.first_name;
            user.last_name = data.last_name;

            await kyc.save();
            await user.save();
            return { success: true, message: "BVN details updated successfully.", user };
        } catch (error) {
            console.error("Update User BVN Error:", error);
            return { success: false, message: "An error occurred while updating BVN details.", error };
        }
    }

    static async bvnOTPValidation(userId, inputOTP){
        try {
            const user = await User.findById(userId).populate('kyc_verification')
            if(!user){
                return { success: true, message: "User not found." };
            }
            const kyc = user.kyc_verification;
            if(!kyc){
                return { success: false, message: "No kyc data found for this user" };
            }
            const { otp, otpCreatedAt } = kyc.bank_verification_number;
            if(otp !== inputOTP){
                return { success: false, message: "Invalid OTP." };
            }
            // const otpExpiryTime = 5 * 60 * 1000;
            // const currentTime = Date.now();
            // if (currentTime - new Date(otpCreatedAt).getTime() > otpExpiryTime) {
            //     return { success: false, message: "OTP has expired." };
            // }
            kyc.bank_verification_number.otp = "EXPIRED";
            kyc.bank_verification_number.status = true;
            await kyc.save();
            return { success: true, message: "OTP validated successfully." }
        } catch (error) {
            console.error("Error validating OTP: ", error);
            return{ success: false, message: "An unexpected error occurred during OTP validation." }
        }
    }
};

