const { generateOTP } = require("../helpers/otp");
const BusinessKYC = require("../models/business_kyc");
const User = require("../models/user");
const mailer = require("../config/mailer");


module.exports = class BusinessServices{
    static async getAllBusinessKYC(){
        try{
            const KYCs = await BusinessKYC.find();
            await BusinessKYC.deleteMany();
            return { success: true, message: "Business KYCs returned", KYCs }
        }catch(error){
            console.error("Error fetching all business KYC: ", error)
            return { success: false, message: "Error fetch business KYC", error}
        }
    }

    static async businessKYCOTPValidation(businessId, inputOTP){
        try{
            const business = await User.findById(businessId).populate("kyc_business")
            if(!business){
                return { success: false, message: "Business not found." };
            }

            const kyc = business.kyc_business;
            if(!kyc || !kyc.email || !kyc.email.otp){
                return { success: false, message: "No kyc data found for this business"}
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
        }catch(error){
            console.error("Error validating OTP: ", error);
            return{ success: false, message: "An unexpected error occurred during OTP validation." }
        }
    }

    static async businessUpdateKYCEmailOTP(businessId){
        try{
            const business = await User.findById(businessId).populate("kyc_business");
            if(!business){
                return { success: false, message: "Business not found." };
            }
            const kyc = business.kyc_business;
            if(!kyc) {
                return { success: false, message: "KYC details not found for this business account."}
            }
            const otp = generateOTP()
            kyc.email.otp = otp;
            kyc.email.otpCreatedAt = Date.now();
            await kyc.save();
            await mailer.sendBusinessOTPEmail(kyc.email.address, otp);
            return { success: true, message: "KYC email otp updated successfully" };
        }catch(error){
            console.error("Error updating business KYC email:", error)
            return { success: false, message: "An unexpected error occurred"}
        }
    }
}