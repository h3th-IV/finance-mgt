const { generateOTP } = require('../helpers/otp');
const BVNData = require('../models/bvnData');
const UserService = require('./userService');
const User = require("../models/user");
const sendSMSOTP = require('../helpers/messenger');


module.exports = class BVNDataService{
    static async createBVNData(bvnDataObject) {
        try {
            const bvnData = new BVNData({
                bvn: bvnDataObject.idNumber,
                firstName: bvnDataObject.firstName,
                middleName: bvnDataObject.middleName || '',
                lastName: bvnDataObject.lastName,
                image: bvnDataObject.image,
                mobile: bvnDataObject.mobile,
                dateOfBirth: new Date(bvnDataObject.dateOfBirth),
                gender: bvnDataObject.gender,
                idNumber: bvnDataObject.idNumber,
                status: bvnDataObject.status,
                allValidationPassed: bvnDataObject.allValidationPassed,
                country: bvnDataObject.country,
                requestedAt: new Date(bvnDataObject.requestedAt),
                metadata: bvnDataObject.metadata,
            });

            await bvnData.save();
            return { success: true, message: 'BVN data saved successfully.', data: bvnData };
        } catch (error) {
            console.error('Error saving BVN data:', error);
            return { success: false, message: 'Error saving BVN data.', error: error.message };
        }
    }

    static async getAllBVNData(){
        try{
            const bvnData = await BVNData.find()
            // await BVNData.deleteMany();
            await BVNData.findByIdAndDelete('676586159dfbd076c2aa7162');
            return { success: true, bvnData};
        }catch(error){
            console.error('Error fetching all BVN data:', error);
            return { success: false, message: 'Error fetching all BVN data.', error: error.message };
        }
    }

    static async getSingleBVNData(bvn){
        try {
            const bvnDatum = await BVNData.findOne({ bvn: bvn })
            return { success: true, message: 'BVN datum returned successfully', bvnDatum };
        } catch (error) {
            return { success: false, message: 'Error fetching single BVN data.', error: error.message };
        }
    }

    static async bvnOTPRegeneration(userId) {
        try {
            const user = await User.findById(userId).populate('kyc_verification');
            if (!user){
                return { success: false, message: "User not found" }
            };
            const userBVNDatum = await BVNData.findOne({ customer: userId });
            if (!userBVNDatum) {
                return { success: false, message: "No BVN data found for this user." };
            }

            const otpTel = userBVNDatum.mobile.slice(-4);
            const otp = generateOTP();
            const kyc = user.kyc_verification;
            if (!kyc || !kyc.bank_verification_number) {
                return { success: false, message: "KYC record not found or incomplete for this user." };
            }
            updateUserDetailsBVN
            kyc.bank_verification_number.otp = otp;
            kyc.bank_verification_number.otpCreatedAt = new Date();
            await kyc.save();
            await user.save();

            const bvnMessage = `Dear user, your OTP for bank verification number with Capitalwise is ${otp}. This OTP is valid for 5 minutes. Please do not share this OTP with anyone.`;

            await sendSMSOTP(userBVNDatum.mobile, otp);

            return { 
                success: true, 
                message: `A new OTP has been sent to the verification number associated with your BVN ending with ${otpTel}.` 
            };
        } catch (error) {
            console.error("Error in BVN OTP Regeneration Logic:", error);
            return { success: false, message: 'Error generating new OTP.' };
        }
    }

}