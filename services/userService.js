const { sendOtp } = require("../config/messenger");
const sendMMSOtp = require("../helpers/messenger");
const { generateOTP } = require("../helpers/otp");
const bankDetails = require("../models/bankDetails");
const kyc = require("../models/kyc");
const User = require("../models/user");
const mailer = require("../config/mailer");


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

    //to test if commits works
    static async getUsers(filters, pagination) {
        const { search, is_verified } = filters;
        const { page = 1, limit = 10 } = pagination;
    
        try {
            const queryFilter = {};
    
            // Filter by is_verified status if provided
            if (typeof is_verified !== 'undefined') {
                queryFilter.is_verified = is_verified;
            }
    
            // Search query
            const searchRegex = search ? new RegExp(search, "i") : null;
    
            // Pagination
            const skip = (page - 1) * limit;
    
            // Query users with filters and pagination
            const users = await User.find({
                ...queryFilter,
                ...(searchRegex ? {
                    $or: [
                        { first_name: searchRegex },
                        { last_name: searchRegex },
                        { phone_number: searchRegex },
                        { email: searchRegex },
                    ],
                } : {}),
            })
                .populate('kyc_verification')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
    
            // Total count of users matching the query
            const totalUsers = await User.countDocuments({
                ...queryFilter,
                ...(searchRegex ? {
                    $or: [
                        { first_name: searchRegex },
                        { last_name: searchRegex },
                        { phone_number: searchRegex },
                        { email: searchRegex },
                    ],
                } : {}),
            });
            // await User.findOneAndDelete('676aaaccf05b16b67db1a9d3');
    
            // Calculate total pages
            const totalPages = Math.ceil(totalUsers / limit);
    
            // Pagination links
            const paginationLinks = {
                first: `/all?page=1&limit=${limit}${is_verified !== undefined ? `&is_verified=${is_verified}` : ""}${search ? `&search=${search}` : ""}`,
                prev: page > 1
                    ? `/all?page=${page - 1}&limit=${limit}${is_verified !== undefined ? `&is_verified=${is_verified}` : ""}${search ? `&search=${search}` : ""}`
                    : null,
                next: page < totalPages
                    ? `/all?page=${page + 1}&limit=${limit}${is_verified !== undefined ? `&is_verified=${is_verified}` : ""}${search ? `&search=${search}` : ""}`
                    : null,
                last: `/all?page=${totalPages}&limit=${limit}${is_verified !== undefined ? `&is_verified=${is_verified}` : ""}${search ? `&search=${search}` : ""}`,
            };
    
            // Response
            return {
                success: true,
                data: {
                    users,
                    links: {
                        first: paginationLinks.first,
                        prev: paginationLinks.prev,
                        next: paginationLinks.next,
                        last: paginationLinks.last,
                        currentPage: page,
                        totalPages: totalPages,
                        totalPerPage: limit,
                        total: totalUsers,
                    },
                },
            };
        } catch (error) {
            console.error("Error fetching users:", error);
            return {
                success: false,
                message: "Could not fetch users",
            };
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
            // const bvnMessage = `Dear user, your OTP for bank verification number with Capitalwise is ${kyc.bank_verification_number.otp}. This OTP is valid for 5 minutes. Please do not share this OTP with anyone.`;
            const bvnMessage = `${kyc.bank_verification_number.otp}`;
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

    static async addUserBankDetails(userId, userBankDetail) {
        try {
            const existingBankDetail = await bankDetails.findOne({ number: userBankDetail.number });
            if (existingBankDetail) {
                console.log('The provided account number is already in use.');
                return { success: false, message: "This account number is already registered." };
            }
            const newDetails = {
                user: userId,
                name: userBankDetail.name,
                number: userBankDetail.number,
                bank: userBankDetail.bank,
            };
    
            const response = await new bankDetails(newDetails).save();
            console.log('Bank details added successfully.');
            return { success: true, message: "Bank details saved successfully.", data: response };
        } catch (error) {
            console.error("Error adding bank details: ", error.message);
            return { success: false, message: "An error occurred while saving bank details." };
        }
    }

    static async getBankDetailsById(bankId) {
        try {
            const bankDetail = await bankDetails.findById(bankId).populate('user', 'first_name last_name');
            if (!bankDetail) {
                return { success: false, message: "Bank details not found." };
            }
            return { success: true, data: bankDetail };
        } catch (error) {
            console.error("Error fetching bank details by ID: ", error.message);
            return { success: false, message: "An error occurred while fetching bank details." };
        }
    }

    static async getUserBankDetails(userId) {
        try {
            const userBankDetails = await bankDetails.find({ user: userId });
            if (userBankDetails.length === 0) {
                return { success: false, message: "No bank details found for this user." };
            }
            return { success: true, data: userBankDetails };
        } catch (error) {
            console.error("Error fetching user's bank details: ", error.message);
            return { success: false, message: "An error occurred while fetching bank details." };
        }
    }

    static async archiveBankAccount(bankId) {
        try {
            const bankDetail = await bankDetails.findById(bankId);
            if (!bankDetail) {
                return { success: false, message: "Bank account not found." };
            }

            bankDetail.status = "not-active";
            await bankDetail.save();

            return { success: true, message: "Bank account archived successfully.", data: bankDetail };
        } catch (error) {
            console.error("Error archiving bank account: ", error.message);
            return { success: false, message: "An error occurred while archiving the bank account." };
        }
    }

    static async sentPasswordUpdateOTP(userId){
        try{
            const user = await User.findById(userId).populate('kyc_verification');
            if (!user){
                return { success: false, message: 'User not found'};
            }
            const kyc = user.kyc_verification;
            const email = kyc.email.address;
            const otp = generateOTP();
            user.otp = otp;
            user.otpCreatedAt = Date.now();
            await user.save();
            mailer.sendUpdatePasswordOTP(email, user.first_name, otp);
            return { success: true, message: 'OTP updated ' }
        }catch(error){
            console.error('Error updating password: ', error);
            return { success: false, message: 'Error generating otp' }
        }
    }

    static async updatePassword(userId, otp, password){
        try{
            const user = await User.findById(userId)
            if(!user){
                return { success: false, message: 'User not found.' }
            }
            if (!user.otp || user.otp !== otp) {
                console.log('logged here');
                return { success: false, message: "Invalid OTP." };
            }
            if (user.isOTPExpired()) {
                return { success: false, message: "Expired OTP." };
            }
            // user.otpCreatedAt = null;
            user.password = password;
            user.otp = "VERIFIED"
            await user.save();
            return { success: true, message: 'Password updated successfully' }
        }catch(error){
            console.error('Error updating password: ', error);
            return { success: false, message: 'Error updating password' }
        }
    }
};
