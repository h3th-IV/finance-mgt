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

module.exports = class UserController {
    static async createUser(req, res) {
        const { error, value } = userValidationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.reduce((acc, err) => {
                acc[err.context.key] = err.message;
                return acc;
            }, {});
            return errorResponse(res, 400, "Validation error", { errors });
        }
    
        const { first_name, last_name, phone_number, password, accountType, business_name } = value;
        console.log({value});
        
    
        try {
            const user_exist = await UserService.getUserByPhone(phone_number);
            if (user_exist) {
                return errorResponse(res, 409, "User with this phone number already exists");
            }
    
            const otp = generateOTP();
            const user = {
                phone_number,
                password,
                otp,
                accountType,
            };
            if (accountType === 'individual') {
                user.first_name = first_name;
                user.last_name = last_name;
            }
            if (accountType === 'business') {
                user.business_name = business_name;
            }
            const response = await UserService.createUser(user);
            if (response?.errors) {
                return errorResponse(res, 500, "An error occurred", response);
            }
    
            const message = `Your OTP for completing signup is ${response.otp}. It will expire in 5 minutes. Please do not share this OTP with anyone.`;
            // await sendSMSOTP(response.phone_number, message);
            
            return successResponse(res, 201, "Your account has been successfully created. An OTP has been sent to your phone number for verification.", response);
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }


    static async deleteUser(req, res) {
        const { userId } = req.params;

        try {
            const deletedUser = await UserService.deleteUserById(userId);

            return successResponse(
                res,
                200,
                "User account deleted successfully",
                { deletedUser }
            );
        } catch (error) {
            if (error.message === "User not found") {
                return errorResponse(res, 404, error.message);
            }

            console.error("Error in deleteUser:", error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }



    static async validateOTP(req, res){
        const { identifier } = req.params;
        const { inputOTP } = req.body;
        if (!identifier) {
            return errorResponse(res, 400, "Missing identifier");
        }
        if (!inputOTP || inputOTP === ""){
            return errorResponse(res, 400, "Please provide the OTP");
        }
        try {
            const responseOTP = await UserService.validateOTP(identifier, inputOTP);
            const user = responseOTP.User;
            if (responseOTP.success) {
                const token = user.getSignedJwtToken();
                const response = {
                    jwToken: token,
                    user,
                }
                return successResponse(res, 200, "OTP validated successfully", response);
            } else {
                return errorResponse(res, 400, responseOTP.message);
            }
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }

    static async regenerateOTP(req, res) {
        const { identifier } = req.params;
        try {
            if(!identifier){
                return errorResponse(res, 400, "Missing identifier")
            }
            const response = await UserService.regenerateOTP(identifier)
            if(!response.success){
                return errorResponse(res, 400, response.message)
            }
            return successResponse(res, 200, "A new OTP has been sent to your phone number, please proceed with validation as it expires soon");
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An error occurred while regenerating the OTP", error);
        }
    }

    static async login(req, res){
        const { error } = loginValidator.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }
        const { identifier, password } = req.body;
        try {
            const query = identifier.includes('@')
            ? { email: identifier.toLowerCase() }
            : { phone_number: identifier };
            const user = await User.findOne(query).populate('kyc_verification');
            if (!user) {
                return errorResponse(res, 401, `User with ${query.email ? "email" : "Phone Number"} not found`);
            }

            const isPassword = await bcryptjs.compare(password, user.password);
            if (!isPassword) {
                return errorResponse(res, 401, "Incorrect password");
            }
            // const loginExp = 24 * 60 * 60 * 1000;
            // if (Date.now() - user.last_login.getTime() > loginExp) {
            //     const otp = generateOTP();
            //     user.otp = otp;
            //     user.otpCreatedAt = Date.now();
            //     await user.save();
            //     mailer.sendLoginOTPEmail(email, user.first_name, user.last_login, otp);
            //     return successResponse(res, 200, "OTP sent to your email. Please verify before logging in.", user);
            // }
            const token = user.getSignedJwtToken();
            if (!user.is_verified) {
                const response = {
                    user,
                    jwToken: token,
                }
            if (user.otp && user.otp !== 'VERIFIED'){
                return errorResponse(res, 400, "Sign up OTP verification is pending verification. Please verify the OTP sent to your phone number.");
            }
            return successResponse(res, 200, "Please complete your KYC verification to continue.", response);
            }
            // user.last_login = Date.now();
            // await user.save();
            const response = {
                jwToken: token,
                user: user,
            }
            return successResponse(res, 200, "Login successful", response);
        } catch (error) {
            console.log("err", error);
            return errorResponse(res, 500, "Server Error");
        }
    }

    static async getAllUsers(req, res) {
        const { page, limit, search, is_verified } = req.query;
    
        try {
            const filters = {
                is_verified: is_verified === 'true' ? true : is_verified === 'false' ? false : undefined,
                search: search || undefined,
            };
    
            const pagination = {
                page: parseInt(page, 10) || 1,
                limit: parseInt(limit, 10) || 10,
            };
    
            const response = await UserService.getUsers(filters, pagination);
    
            if (response.success) {
                return successResponse(res, 200, "Users returned successfully", response.data);
            } else {
                return errorResponse(res, 400, "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            return errorResponse(res, 500, "Server Error");
        }
    }
    

    static async getSingleUser(req, res){
        try {
            console.log({req: req.params});
            const response = await UserService.getUserByID(req.params.id);
            return successResponse(res, 200, "User returned successfully", response);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }

    static async forgotPasswordOTP(req, res) {
        const { phone_number } = req.body;
        const otp = generateOTP();

        try {
            const response = await UserService.updateOTP(phone_number, otp);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }

            // const message = `Dear user, your OTP for resetting your Capitalwise account password is ${otp}. This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this message.`;
            const message = `${otp}`;
            await  await sendSMSOTP(user.phone_number, otp);

            // await mailer.sendForgotPassword(email, otp);

            return successResponse(res, 200, "Password reset OTP sent successfully!");
        } catch (error) {
            console.error("Error in forgotPasswordOTP controller:", error.message);
            return errorResponse(res, 500, "Unable to send password reset OTP.");
        }
    }

    static async resetPassword(req, res) {
        const { error } = resetPasswordValidator.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const { phone_number, otp, new_password } = req.body;
        try {
            const response = await UserService.resetPassword(phone_number, otp, new_password);
            if (response.success) {
                return successResponse(res, 200, response.message);
            } else {
                return errorResponse(res, 400, response.message);
            }
        } catch (error) {
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }

    static async updateKYC(req, res) {
        const { userId } = req.params;

        const { error } = kycValidator.validate(req.body, { abortEarly: false });
        if (error) {
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

        const kycData = req.body;
        let otpSent = false;
        let otpBVN = false;
        let otpNUm = ''

        try {
            const { user, kycRecord } = await fetchUserAndKYC(userId);
            if (kycRecord){
                if (kycRecord.email.otp && kycRecord.email.otp !== 'VERIFIED') {
                    return errorResponse(res, 400, "Email OTP is pending verification. Please verify the OTP sent to your email.");
                }

                if (kycRecord.bank_verification_number.otp && kycRecord.bank_verification_number.otp !== 'VERIFIED') {
                    return errorResponse(res, 400, "BVN OTP is pending verification. Please verify the OTP sent to the associated phone number.");
                }
            }

            if (kycData['email.address']) {
                const existEmailKYC = await KYC.findOne({ "email.address": kycData['email.address'] });
                if (existEmailKYC && (!kycRecord || kycRecord.email.address !== kycData['email.address'])) {
                    return errorResponse(res, 400, "The provided email address has already been used.");
                }

                if (kycRecord?.email?.address === kycData['email.address']) {
                    return successResponse(res, 200, "This email address is already associated with your account. Please proceed to OTP validation.");
                }

                const otp = generateOTP();
                const firstName = user.first_name;

                await mailer.sendOTPEmail(kycData['email.address'], firstName, otp);

                kycData.email = {
                    address: kycData['email.address'],
                    otp,
                    otpCreatedAt: Date.now(),
                };
                otpSent = true;
            }
            if(kycData['bank_verification_number.bvn']){
                const existBVNKYC = await KYC.findOne({ "bank_verification_number.bvn": kycData['bank_verification_number.bvn'] })
                if (existBVNKYC){
                    return errorResponse(res, 400, "The provided bvn has been used");
                }
                //if we have the bvnData saved already
                const existBVNData = await BVNData.findOne({ bvn: kycData['bank_verification_number.bvn'] })
                if (existBVNData){
                    console.log('bvnData exist in database');
                    const { firstName, lastName, idNumber, dateOfBirth, mobile } = existBVNData
                    const data = {
                        first_name: firstName,
                        last_name: lastName,
                        otp: generateOTP(),
                        bvn: idNumber,
                        dob: dateOfBirth,
                        number: mobile,
                    };
                    otpNUm = mobile.slice(-4);
                    const response = await UserService.updateUserDetailsBVN(userId, data);
                    if (!response.success) {
                        return errorResponse(res, 500, response.message);
                    }
                    otpBVN = true;
                } else{
                    console.log('bvnData not exist in database');
                    try {
                        const bvnData = await verifyBVN(kycData['bank_verification_number.bvn']);
                        if (!bvnData || !bvnData.data || bvnData.data.status !== 'found') {
                            return errorResponse(res, 400, "BVN verification failed. Please check the BVN provided.");
                        }
                        const saveBVN = await BVNDataService.createBVNData(bvnData.data);
                        if (!saveBVN.success){
                            return errorResponse(res, 500, saveBVN.message);
                        }
                        const { firstName, lastName, idNumber, dateOfBirth, mobile } = bvnData.data;
                        const data = {
                            first_name: firstName,
                            last_name: lastName,
                            otp: generateOTP(),
                            bvn: idNumber,
                            dob: dateOfBirth,
                            number: mobile,
                        };
                        otpNUm = mobile.slice(-4);
                        const response = await UserService.updateUserDetailsBVN(userId, data);

                        if (!response.success) {
                            return errorResponse(res, 500, response.message);
                        }
                        otpBVN = true;
                    } catch (bvnError) {
                        console.error("BVN Verification Error:", bvnError.text);
                        return errorResponse(res, bvnError.statusCode || 500, bvnError.message);
                    }
                }
                
            }
            if(kycData['document_verification.doc_no']){
                const existDOC_NO_KYC = await KYC.findOne({ "document_verification.doc_no": kycData['document_verification.doc_no'] })
                if (existDOC_NO_KYC){
                    return errorResponse(res, 400, "The provided document number has been used")
                }
            }
            user.email = kycData['email.address'];
            const updateData = combineKYCData(kycData, req.files, kycRecord);

            let updatedKYC;
            if (kycRecord) {
                updatedKYC = await KYC.findByIdAndUpdate(kycRecord._id, updateData, {
                    new: true,
                    runValidators: true,
                });
            } else {
                updatedKYC = new KYC(updateData);
                await updatedKYC.save();
                user.kyc_verification = updatedKYC._id;
            }

            const { emailVerified, bankVerified, documentVerified, addressVerified, employmentInfoVerified } = calculateStatuses(kycData, req.files, updatedKYC);

            updatedKYC.email.status = emailVerified;
            updatedKYC.bank_verification_number.status = bankVerified;
            updatedKYC.document_verification.status = documentVerified;
            updatedKYC.address.status = addressVerified;
            updatedKYC.employment_info.status = employmentInfoVerified;
            await updatedKYC.save();

            user.is_verified = emailVerified && bankVerified && documentVerified && addressVerified && employmentInfoVerified;
            await user.save();

            const updatedUser = await User.findById(userId).populate('kyc_verification');

            let message = "KYC information updated successfully.";
            if (otpSent) message += " An OTP has been sent to your email.";
            if (otpBVN) message += ` An OTP has also been sent to the phone number associated with your BVN ending with ${otpNUm}.`;

            return successResponse(res, 200, message, {
                user: updatedUser,
            });
        } catch (error) {
            console.error("Error updating KYC:", error.message);
            if (error.statusCode === 404) {
                return errorResponse(res, 404, error.message);
            }
            return errorResponse(res, 500, "Server error");
        }
    }

    
    static async getAllUser(req, res){
        try {
            const response = await UserService.getUserByID(req.params.id);
            return successResponse(res, 200, "Users returned successfully", response);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }

   static async kycEmailOTPValidation(req, res) {
        const { userId } = req.params;
        const { inputOTP } = req.body;

        if (!userId) {
            return errorResponse(res, 400, "Missing user ID.");
        }
        if (!inputOTP || inputOTP.trim() === "") {
            return errorResponse(res, 400, "Please provide the OTP.");
        }

        try {
            const result = await UserService.kycEmailOTPValidation(userId, inputOTP);

            if (!result.success) {
                return errorResponse(res, 400, result.message);
            }
            return successResponse(res, 200, result.message, null);
        } catch (error) {
            console.error("Error in kycEmailOTPValidation:", error.message);
            return errorResponse(res, 500, "An unexpected server error occurred.", error);
        }
    }

    static async kycRegenEmailOTP(req, res){
        const userId = req.params.userId
        try{
            const user = await UserService.getUserByID(userId);
            if(!user){
                return errorResponse(res, 404, "User not found");
            }
            const otp = generateOTP();
            if (otp){
                await UserService.updateKYCEmailOTP(userId, otp);
                mailer.sendOTPEmail(user.email, user.first_name, otp);
                return successResponse(res, 200, 'A new OTP has been sent to your email');
            } else{
                return errorResponse(res, 400, "OTP is still valid. Please try again later.");
            }
        }catch(error){
            console.log(error);
            return errorResponse(res, 500, "An error occurred while regenerating OTP", error);
        }
    }   

    static async bvnOTPValidation(req, res){
        const { userId } = req.params;
        const { inputOTP } = req.body;
         if (!userId) {
            return errorResponse(res, 400, "Missing user ID.");
        }
        if (!inputOTP || inputOTP.trim() === "") {
            return errorResponse(res, 400, "Please provide the OTP.");
        }

        try{
            const result = await UserService.bvnOTPValidation(userId, inputOTP);
            if (!result.success){
                return errorResponse(res, 400, result.message);
            }
            return successResponse(res, 200, result.message);
        }catch(error){
            console.error("Error validating OTP: ", error);
            return errorResponse(res, 500, "An unexpected server error occurred", error);
        }
    }

    static async bvnOTPRegen(req, res) {
        const { userId } = req.params;
        try {
            const result = await BVNDataService.bvnOTPRegeneration(userId);
            if (!result.success) {
                return errorResponse(res, 500, result.message);
            }

            return successResponse(res, 200, result.message);
        } catch (error) {
            console.error("Error in BVN OTP Regeneration:", error);
            return errorResponse(res, 500, 'Internal Server Error');
        }
    }

    static async addUserBankDetails(req, res) {
        const { userId } = req.params;
        const { error, value } = bankDetailsValidator.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }
        try {
            const bankDetails = {
                name: value.name,
                number: value.number,
                bank: value.bank,
                bank_code: value.bank_code,
            };
            const response = await UserService.addUserBankDetails(userId, bankDetails);
    
            if (!response.success) {
                return errorResponse(res, 400, response.message);
            }
            return successResponse(res, 201, 'Bank details saved successfully.', response.data);
        } catch (error) {
            console.error('Controller error: ', error.message);
            return errorResponse(res, 500, 'Internal Server Error');
        }
    }


    static async getBankDetailsById(req, res) {
        const { bankId } = req.params;
        try {
            const response = await UserService.getBankDetailsById(bankId);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }
            return successResponse(res, 200, "Bank details fetched successfully.", response.data);
        } catch (error) {
            console.error("Controller error (getBankDetailsById): ", error.message);
            return errorResponse(res, 500, "Internal Server Error");
        }
    }


    static async getUserBankDetails(req, res) {
        const { userId } = req.params;
        try {
            const response = await UserService.getUserBankDetails(userId);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }
            return successResponse(res, 200, "User bank details fetched successfully.", response.data);
        } catch (error) {
            console.error("Controller error (getUserBankDetails): ", error.message);
            return errorResponse(res, 500, "Internal Server Error");
        }
    }

    // Controller Method to Archive a Bank Account
    static async archiveBankAccount(req, res) {
        const { bankId } = req.params;
        try {
            const response = await UserService.archiveBankAccount(bankId);
            if (!response.success) {
                return errorResponse(res, 400, response.message);
            }
            return successResponse(res, 200, "Bank account archived successfully.", response.data);
        } catch (error) {
            console.error("Controller error (archiveBankAccount): ", error.message);
            return errorResponse(res, 500, "Internal Server Error");
        }
    }

    static async sendPasswordUpdateOTP(req, res){
        const { userId } = req.params;
        if (!userId){
            return errorResponse(res, 400, 'Missing user ID')
        }
        try{
            const response = await UserService.sentPasswordUpdateOTP(userId);
            if (!response.success){
                return errorResponse(res, 400, response.message);
            }
            return successResponse(res, 200, 'An OTP has been sent to your KYC verified email address');
        }catch(error){
            console.error('Error sending update OTP ', error);
            return errorResponse(res, 500, 'Internal Server Error')
        }
    }

    static async updatePassword(req, res){
        const { userId } = req.params;
        if (!userId){
            return errorResponse(res, 400, 'Missing user ID');
        }
        try{
            const { error, value } = updatePasswordValidator.validate(req.body);
            if (error){
                return errorResponse(res, 400, error.details[0].message);
            }
            const otp = value.otp;
            const password = value.password;
            const response = await UserService.updatePassword(userId, otp, password);
            if (!response.success){
                return errorResponse(res, 400, response.message);
            }
            return successResponse(res, 200, 'Password updated successfully');
        }catch(error){
            console.error('Error updating password: ', error);
            return errorResponse(res, 500, 'Internal server error');
        }
    }
};