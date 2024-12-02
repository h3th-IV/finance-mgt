const UserService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/responses");
const mailer = require("../config/mailer");
const bcryptjs = require("bcryptjs");
const KYC = require("../models/kyc");
const User = require("../models/user")
const { userValidationSchema } = require("../validators/userValidators");
const { loginValidator } = require('../validators/user.validator');
const { resetPasswordValidator } = require('../validators/user.validator');
const { kycValidator } = require('../validators/kyc.validator')
const { fetchUserAndKYC, combineKYCData, calculateStatuses } = require('../helpers/kyc.helper');
const { generateOTP} = require('../helpers/otp');

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
        const { first_name, last_name, email, number, password } = value;

        try {
            const lower_email = email.toLowerCase();
            const user_exist = await UserService.getUserByEmail(lower_email);
            if (user_exist) {
            return errorResponse(res, 409, "User with this email already exists");
            }

            const otp = generateOTP();
            const user = {
            first_name,
            last_name,
            email: lower_email,
            number,
            password,
            otp,
            };

            const response = await UserService.createUser(user);
            if (response?.errors) {
            return errorResponse(res, 500, "An error occurred", response);
            }

            mailer.sendOTPEmail(email, first_name, otp);
            return successResponse(res, 201, "User created successfully. Please check your email for OTP verification.", response);
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }

    static async validateOTP(req, res){
        const userId = req.params.userId;
        const { inputOTP } = req.body;
        if (!userId) {
            return errorResponse(res, 400, "Missing user ID");
        }
        if (!inputOTP || inputOTP === ""){
            return errorResponse(res, 400, "Please provide the OTP");
        }
        try {
            const responseOTP = await UserService.validateOTP(userId, inputOTP);
            const user = responseOTP.User;
            if (responseOTP.success) {
                const token = user.getSignedJwtToken();
                const response = {
                    jwToken: token,
                    name: user.first_name,
                    email: user.email,
                    phone: user.phone_number,
                    message: "OTP validated successfully"
                }
                return successResponse(res, 200, response);
            } else {
                return errorResponse(res, 400, responseOTP.message);
            }
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, "An unexpected error occurred", error);
        }
    }

    static async regenerateOTP(req, res) {
        const userId = req.params.userId;
        try {
            const user = await UserService.getUserByID(userId);
            if (!user) {
                return errorResponse(res, 404, "User not found");
            }
            const newOTP = await user.regenerateOTP();
            if (newOTP) {
                mailer.sendOTPEmail(user.email, user.first_name, newOTP);
                return successResponse(res, 200, "A new OTP has been sent to your email");
            } else {
                return errorResponse(res, 400, "OTP is still valid. Please try again later");
            }
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
                return errorResponse(res, 401, `User with ${query.email ? "email" : "phone_number"} not found`);
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

    static async getAllUsers(req, res){
        try {
            const response = await UserService.getUsers();
            return successResponse(res, 200, "Users returned successfully", response);
        } catch (error) {
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

    static async forgotPasswordOTP(req, res){
        const { email } = req.body;
        const otp = generateOTP()
        try {
            const response = await UserService.updateOTP(email, otp);
            mailer.sendForgotPassword(email, otp);
            return successResponse(res, 200, "Password reset email sent!");
        } catch (error) {
            return errorResponse(res, 500, "Unable to send password reset email");
        }
    }

    static async resetPassword(req, res) {
        const { error } = resetPasswordValidator.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const { email, otp, new_password } = req.body;
        try {
            const response = await UserService.resetPassword(email, otp, new_password);
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

        try {
            const { user, kycRecord } = await fetchUserAndKYC(userId);

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

            const { bankVerified, facialVerified, documentVerified } = calculateStatuses(kycData, req.files, updatedKYC);

            updatedKYC.bank_verification_number.status = bankVerified;
            updatedKYC.facial_verification.status = facialVerified;
            updatedKYC.document_verification.status = documentVerified;
            await updatedKYC.save();

            user.is_verified = bankVerified && facialVerified && documentVerified;
            await user.save();

            const updatedUser = await User.findById(userId).populate('kyc_verification');
            // console.log("Response data:", updatedUser);
            return successResponse(res, 200, "KYC information updated successfully", {
                user: updatedUser,
            });
        } catch (error) {
            console.error("Error updating KYC:", error.message);
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
};