const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");
const User = require("../models/user")
const { generateOTP} = require('../helpers/otp');
const user = require("../models/user");
const { businessKYCValidator } = require("../validators/bus.kyc.validator");
const { fetchBusinessKYC, fetchBusinessAndKYC, combineBusinessKYCData, calculateBusinessStatuses } = require("../helpers/bus_kyc.helpers");
const BusinessKYC = require("../models/business_kyc");
const BusinessServices = require("../services/business");
const UserService = require("../services/userService");


module.exports = class BusinessControllers {
    static async businessUpdateKYC(req, res) {
        const { businessId } = req.params;

        let jsonData = {};
        let sanitizedJsonData = {};
        if (req.body.data) {
            try {
                jsonData = JSON.parse(req.body.data);
            } catch (err) {
                console.error(err);
                return errorResponse(res, 400, "Invalid JSON format in request body");
            }

            if (!jsonData) {
                return errorResponse(res, 400, "Request body is not complete");
            }

            sanitizedJsonData = sanitizeEmptyStrings(jsonData);
        }

        const payload = {
            'email.address': req.body.email || undefined,
            ...sanitizedJsonData,
            'business_address.address': req.body.address || undefined,
            'business_address.proof_of_address': req.files?.['business_address.proof_of_address']?.[0]?.path || undefined,
            'employee_size.size': req.body.employee_size || undefined,
            'cac.number': req.body.cac_number || undefined,
            'cac.certificate': req.files?.['cac_certificate']?.[0]?.path || undefined,
        };
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

        console.log('Validation passed');
        let otpSent = false;

        try {
            const { business, kycRecord } = await fetchBusinessAndKYC(businessId);

            //check pending email OTP verification
            if (kycRecord) {
                if (kycRecord.email.otp && kycRecord.email.otp !== 'VERIFIED') {
                    return errorResponse(res, 400, "Email OTP is pending verification. Please verify the OTP sent to your email.");
                }
            }

            //check if business email has not been used
            if (payload['email.address']) {
                console.log("errrrXXXXXXXXX")
                const existBusinessEmail = await BusinessKYC.findOne({ "email.address": payload["email.address"] });
                const isEmailUsedByAnother = existBusinessEmail && (!kycRecord || existBusinessEmail._id.toString() !== kycRecord._id.toString());

                if (isEmailUsedByAnother) {
                    return errorResponse(res, 400, "The provided business email address has already been used.");
                }

                if (kycRecord?.email?.address === payload['email.address']) {
                    return successResponse(res, 200, "This email address is already associated with your account. Please proceed to OTP validation.");
                }

                const otp = generateOTP();

                await mailer.sendBusinessOTPEmail(payload['email.address'], otp);

                payload['email'] = {
                    address: payload['email.address'],
                    otp,
                    otpCreatedAt: Date.now(),
                };
                delete payload['email.address']; //remove the redundant flattened key                
                otpSent = true;
                console.log("errrrYYYYYYYYY")
            }


    //safely get sanitized emails and BVNs
            const ownerEmails = sanitizedJsonData?.owners_partner_info?.map((owner) => owner.email) || [];
            const ownerBVNs = sanitizedJsonData?.owners_partner_info?.map((owner) => owner.bvn) || [];
            const directorEmails = sanitizedJsonData?.directors_bvn_verification?.map((director) => director.email) || [];
            const directorBVNs = sanitizedJsonData?.directors_bvn_verification?.map((director) => director.bvn) || [];

            const allEmails = [...ownerEmails, ...directorEmails, req.body.email];
            const allBVNs = [...ownerBVNs, ...directorBVNs];
    
            //check for existing emails and BVNs
            // const existingEmails = await BusinessKYC.checkForExistingEmails(allEmails);
            // const existingBVNs = await BusinessKYC.checkForExistingBVNs(allBVNs);
            // if (existingEmails.length > 0 || existingBVNs.length > 0) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Some emails or BVNs are already in use.",
            //         errors: {
            //             existingEmails,
            //             existingBVNs,
            //         },
            //     });
            // }

            //check cac number
            // if (payload["cac.number"]) {
            //     const existCACNumber = await BusinessKYC.findOne({ "cac.number": payload["cac.number"] });
            
            //     const isCACNumberUsedByAnother = existCACNumber && (!kycRecord || existCACNumber._id.toString() !== kycRecord._id.toString());
            
            //     if (isCACNumberUsedByAnother) {
            //         return errorResponse(res, 400, "The provided CAC number has already been used.");
            //     }
            // }
            const updateData = combineBusinessKYCData(payload, req.files, kycRecord);

    
            let updatedBusinessKYC;
            if (kycRecord) {
                updatedBusinessKYC = await BusinessKYC.findByIdAndUpdate(kycRecord._id, updateData, {
                    new: true,
                    runValidators: true,
                });
            } else {
                updatedBusinessKYC = new BusinessKYC(updateData);
                await updatedBusinessKYC.save();
                business.kyc_business = updatedBusinessKYC._id;
            }
            if (updatedBusinessKYC) {
                //dynamically set statuses
                updatedBusinessKYC.business_address.status = Boolean(
                    updatedBusinessKYC.business_address.address && updatedBusinessKYC.business_address.proof_of_address
                );
                updatedBusinessKYC.cac.status = Boolean(
                    updatedBusinessKYC.cac.number &&
                    updatedBusinessKYC.cac.certificate
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
            const { isFullyVerified } = calculateBusinessStatuses(payload, req.files, updatedBusinessKYC);
            console.log('isFullyVerified:', isFullyVerified);
    
            business.is_verified = isFullyVerified;
            await business.save();
    
            const updatedBusiness = await User.findById(businessId).populate('kyc_business');

            //alert email top sent...
            let message = "KYC information updated successfully.";
            if (otpSent) message += " An OTP has been sent to your email.";

            return successResponse(res, 200, message, updatedBusiness);
        } catch (error) {
            console.error("Error updating KYC:", error.message);
            if (error.statusCode === 404) {
                return errorResponse(res, 404, error.message);
            }
            return errorResponse(res, 500, "Server error");
        }
    }
    

    static async businessTest(req, res){
        try {
            const response = await BusinessServices.getAllBusinessKYC();
            return successResponse(res, 200, "Test went through", response.KYCs);
        } catch (error) {
            return errorResponse(res, 500, "Error")
        }
    }

    static async businessKYCEmailOTPValidation(req, res){
        const { businessId } = req.params;
        const { inputOTP } = req.body;
        
        if (!businessId) {
            return errorResponse(res, 400, "Missing business ID.");
        }

        if (!inputOTP || inputOTP.trim() === "") {
            return errorResponse(res, 400, "Please provide the OTP.");
        }

        try{
            const result = await BusinessServices.businessKYCOTPValidation(businessId, inputOTP);

            if(!result.success){
                return errorResponse(res, 400, result.message);
            }
            return successResponse(res, 200, result.message, result.busi_ness );
        }catch(error){
            console.error("Error in BusinessKYCEmailOTPValidation: ", error.message);
            return errorResponse(res, 500, "An unexpected server error occurred.", error); 
        }
    }

    static async businessKYCRegenEmailOTP(req, res){
        const businessId = req.params.businessId
        if(!businessId){
            return errorResponse(res, 404, "Missing businessId")
        }
        try{
            const response = await BusinessServices.businessUpdateKYCEmailOTP(businessId);
            if(!response.success){
                return errorResponse(res, 400, response.message);
            }
            return successResponse(res, 200, "An OTP has been sent to your email. Please proceed with validation promptly, as it will expire shortly.");
        }catch(error){
            console.error("Error updating new otp for business: ", error)
            return errorResponse(res, 500, "An unexpected server error occurred")
        }
    }
}


function sanitizeEmptyStrings(payload) {
    if (Array.isArray(payload)) {
        return payload.map(sanitizeEmptyStrings); //recursively sanitize arrays
    }
    if (typeof payload === 'object' && payload !== null) {
        return Object.entries(payload).reduce((acc, [key, value]) => {
            acc[key] = sanitizeEmptyStrings(value); //recursively process nested objects
            return acc;
        }, {});
    }
    //replace only empty strings with null
    return payload === '' ? null : payload;
}