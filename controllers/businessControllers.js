const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");
const bcryptjs = require("bcryptjs");
const KYC = require("../models/kyc");
const User = require("../models/user")
const { userValidationSchema } = require("../validators/userValidators");
const { loginValidator, updatePasswordValidator } = require('../validators/user.validator');
const { resetPasswordValidator } = require('../validators/user.validator');
const { kycValidator } = require('../validators/kyc.validator')
const { fetchUserAndKYC, combineKYCData, calculateStatuses } = require('../helpers/kyc.helper');
const { generateOTP} = require('../helpers/otp');
const verifyBVN = require("../helpers/verifyBVN");
// const sendOtp = require("../helpers/messenger");
const sendSMSOTP = require("../helpers/messenger");
const formatMobileNumber = require("../helpers/formatPhone");
const BVNDataService = require("../services/bvnDataService");
const BVNData = require('../models/bvnData');
const { sendOtp } = require("../config/messenger");
const sendMMSOtp = require("../helpers/messenger");
const user = require("../models/user");
const { bankDetailsValidator } = require("../validators/bankDetailsValidator");
const { businessKYCValidator } = require("../validators/bus.kyc.validator");
const { fetchBusinessKYC, fetchBusinessAndKYC, combineBusinessKYCData, calculateBusinessStatuses } = require("../helpers/bus_kyc.helpers");
const BusinessKYC = require("../models/business_kyc");


module.exports = class BusinessControllers {
    static async businessUpdateKYC(req, res) {
        const { businessId } = req.params;
        const jsonData = JSON.parse(req.body.data);
        if(!jsonData){
            return errorResponse(res, 400, "request body is not complete")
        }
        const { business_address, employee_size, ...restJsonData } = jsonData;
        console.log('jsonData', jsonData);
        const payload = {
            ...restJsonData,
            'business_address.address': jsonData.business_address?.address || null,
            'business_address.proof_of_address': req.files['business_address.proof_of_address']
                ? req.files['business_address.proof_of_address'][0].path
                : null,
            'employee_size.size': jsonData.employee_size?.size || null,
            'business_registration.certificate': req.files['business_registration.certificate']
                ? req.files['business_registration.certificate'][0].path
                : null,
        };
        console.log('payloadData', payload);
        const { error, value } = businessKYCValidator.validate(payload, { abortEarly: false});
        if(error){
            const errors = error.details.reduce((acc, err) => {
                acc[err.context.key] = err.message;
                return acc;
            }, {});
            return res.status(400).json({
                success: false,
                errors,
                data: null,
            });
        }
        try{
            const { business, kycRecord } = await fetchBusinessAndKYC(businessId);
            
            //get partner emails and check if they dont exist
            const ownerEmails = jsonData.owners_partner_info?.map((owner) => owner.email) || [];
            //get partner BVNs and check if they dont exist
            const ownerBVNs = jsonData.owners_partner_info?.map((owner) => owner.bvn) || [];
            //get director emails
            const directorEmails = jsonData.directors_bvn_verification?.map((director) => director.email) || [];
            //get director BVNs
            const directorBVNs = jsonData.directors_bvn_verification?.map((director) => director.bvn) || [];

            //combine emails and BVNs
            const allEmails = [...ownerEmails, ...directorEmails];
            const allBVNs = [...ownerBVNs, ...directorBVNs];

            const existingEmails = await BusinessKYC.checkForExistingEmails(allEmails);
            const existingBVNs = await BusinessKYC.checkForExistingBVNs(allBVNs);
            if (existingEmails.length > 0 || existingBVNs.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Some emails or BVNs are already in use.",
                    errors: {
                        existingEmails,
                        existingBVNs,
                    },
                });
            }
            const updateData = combineBusinessKYCData(payload, req.files, kycRecord);

            let updatedBusinessKYC
            if(kycRecord){
                updatedBusinessKYC = await BusinessKYC.findByIdAndUpdate(kycRecord._id, updateData, {
                    new: true,
                    runValidators: true,
                });
            } else{
                updatedBusinessKYC = new BusinessKYC(updateData);
                await updatedBusinessKYC.save();
                business.kyc_business = updatedBusinessKYC._id;
            }
            if (updatedBusinessKYC) {
                //dyynamically set statuses based on provided data
                updatedBusinessKYC.business_registration.status = Boolean(updatedBusinessKYC.business_registration.certificate);
                updatedBusinessKYC.business_address.status = Boolean(
                    updatedBusinessKYC.business_address.address && updatedBusinessKYC.business_address.proof_of_address
                );
                updatedBusinessKYC.employee_size.status = Boolean(updatedBusinessKYC.employee_size.size >= 1);
            
                updatedBusinessKYC.owners_partner_info.forEach((owner) => {
                    owner.status = Boolean(
                        owner.name && owner.phone_number && owner.email && owner.bvn && owner.bvn.length === 11 && /^\d+$/.test(owner.bvn)
                    );
                });
            
                updatedBusinessKYC.directors_bvn_verification.forEach((director) => {
                    director.status = Boolean(
                        director.director_name && director.email && director.bvn && director.bvn.length === 11 && /^\d+$/.test(director.bvn)
                    );
                });
            
                await updatedBusinessKYC.save();
            }
            
            const { ownersVerified, registrationVerified, directorsVerified, addressVerified, employeeSizeVerified, isFullyVerified } = calculateBusinessStatuses(payload, req.files, updatedBusinessKYC);
            console.log('isFUllyVErified', isFullyVerified);
            
            //update the business verification status
            business.is_verified = isFullyVerified;
            await business.save();

            const updatedBusiness = await User.findById(businessId).populate('kyc_business');
            console.log(updatedBusiness);
            return successResponse(
                res,
                200,
                "KYC for business account updated successfully",
                payload//updatedBusiness
            );
        }catch(error){
            console.error("Error updating KYC:", error.message);
            if (error.statusCode === 404) {
                return errorResponse(res, 404, error.message);
            }
            return errorResponse(res, 500, "Server error");
        }
    }


    static async businessTest(req, res){
        try {
            return successResponse(res, 200, "Test went through");
        } catch (error) {
            return errorResponse(res, 500, "Error")
        }
    }
}