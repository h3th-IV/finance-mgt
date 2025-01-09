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
const { fetchBusinessKYC, fetchBusinessAndKYC } = require("../helpers/bus_kyc.helpers");


module.exports = class BusinessControllers {
    static async businessUpdateKYC(req, res) {
        const { businessId } = req.params;
        const { error, value } = businessKYCValidator.validate(req.body, { abortEarly: false});
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
        const businessKYCData = req.body;
        let otpSent = false;
        let otpBVN = false;
        let otpNUm = '';
    
        try{
            const { business, kycRecord } = await fetchBusinessAndKYC(businessId);
            const data = {
                business,
                kycRecord
            }
            return successResponse(res, 200, "business and kyc_business", data)
        }catch(error){
            console.error("Error updating KYC:", error.message);
            if (error.statusCode === 404) {
                return errorResponse(res, 404, error.message);
            }
            return errorResponse(res, 500, "Server error");
        }
    }
}