const { sendOtp } = require("../config/messenger");
const sendMMSOtp = require("../helpers/messenger");
const kyc = require("../models/kyc");
const User = require("../models/user");

module.exports = class UserService {
    static async createUser(data) {
        try {
            const newUser = {
                first_name: data.first_name,
                last_name: data.last_name,
                phone_number: data.number,
                password: data.password,
                otp: data.otp,
            };
            const response = await new User(newUser).save();
            console.log("User saved successfully:", response);
    
            try {
                // const message = `Welcome to Capitalwise! Your OTP for completing signup is ${response.otp}. It will expire in 5 minutes. Please do not share this OTP with anyone.`;
                const message = `${response.otp}`;
                await sendMMSOtp(response.phone_number, message);
                console.log("OTP sent successfully.");
            } catch (otpError) {
                console.error("Failed to send OTP:", otpError);
            }
            return response;
        } catch (error) {
            console.error("Error in createUser:", error);
            return { error: "Failed to create user.", details: error };
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
            // await User.findByIdAndDelete('');
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
                user.otp = "VERIFIED";
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
    static async updateOTP(phone_number, otp) {
        try {
            const updateUser = await User.findOneAndUpdate(
                { phone_number: phone_number },
                { otp: otp, otpCreatedAt: Date.now() },
                { new: true }
            );
            if (!updateUser) {
                return { success: false, message: "User not found." };
            }
            return { success: true, data: updateUser };
        } catch (error) {
            console.error("Error in updateOTP service:", error.message);
            return { success: false, message: "Error updating OTP." };
        }
    }

    static async resetPassword(phone_number, otp, new_password) {
        try {
            const user = await User.findOne({ phone_number: phone_number });

            if (!user) {
                return { success: false, message: "User not found." };
            }

            if (user.otp !== otp || user.isOTPExpired()) {
                return { success: false, message: "Invalid or expired OTP." };
            }
            user.otp = "VERIFIED";
            // user.otpCreatedAt = null;

            user.password = new_password;
            await user.save();

            return { success: true, message: "Password reset successfully." };
        } catch (error) {
            console.error("Error resetting password:", error);
            return { success: false, message: "An error occurred while resetting the password.", error };
        }
    }

    static async kycEmailOTPValidation(userId, inputOTP){
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
            kyc.email.otp = "VERIFIED";
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
            const bvnMessage = `Dear user, your OTP for bank verification number with Capitalwise is ${kyc.bank_verification_number.otp}. This OTP is valid for 5 minutes. Please do not share this OTP with anyone.`;
            await sendMMSOtp(data.number, bvnMessage);
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
            const otpExpiryTime = 5 * 60 * 1000;
            const currentTime = Date.now();
            if (currentTime - new Date(otpCreatedAt).getTime() > otpExpiryTime) {
                return { success: false, message: "OTP has expired." };
            }
            kyc.bank_verification_number.otp = "VERIFIED";
            kyc.bank_verification_number.status = true;
            await kyc.save();
            return { success: true, message: "OTP validated successfully." }
        } catch (error) {
            console.error("Error validating OTP: ", error);
            return{ success: false, message: "An unexpected error occurred during OTP validation." }
        }
    }
};

