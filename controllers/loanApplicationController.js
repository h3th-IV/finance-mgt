const LoanApplicationService = require("../services/loanApplicationService");
const { successResponse, errorResponse } = require("../utils/responses");
const { loanApplicationValidator, updateLoanApplicationValidator, loanApplicationCalcValidator } = require("../validators/loanApplication.validator");
const { validateRequiredFiles } = require('../helpers/validateFiles.helper');
const { loanCalculatorValidator } = require('../validators/loanCalc.validator');
const { calculateRepaymentPlan } = require('../helpers/calcRepayment.helper');
const AdminService = require('../services/adminService')
const mailer = require("../config/mailer");
const loanApplication = require("../models/loanApplication");
const mongoose = require("mongoose");
const GuarantorsDataService = require("../services/guarantorsDataService");
const { generateOfferLetter } = require("../services/offerLetterService");




module.exports = class LoanApplicationController {
    // static async createLoanApplication(req, res) {
    //     const { id, isStaff } = req.user;
    //     const { customerId } = req.params; //customer id

    //     const { loan_product, loan_amount, loan_duration } = req.body;
    //     const files = req.files;

    //     try {
    //         const { error, value } = loanApplicationValidator.validate(
    //             req.body
    //         );
    //         if (error) {
    //             return errorResponse(res, 400, error.details[0].message);
    //         }

    //         const fileError = validateRequiredFiles(files);
    //         if (fileError) {
    //             return errorResponse(res, 400, fileError);
    //         }
    //         const createdByType = isStaff ? "Staff" : "User";
    //         const createdBy = id;
    //         const processingFee = parseFloat(value.loan_amount) * 0.01;
    //         const loanData = {
    //             customer: customerId,
    //             loan_product,
    //             loan_amount: parseFloat(value.loan_amount),
    //             loan_duration: parseInt(value.loan_duration, 10),
    //             guarantor1: {
    //                 name: value["guarantor1.name"],
    //                 email: value["guarantor1.email"],
    //                 phone_number: value["guarantor1.phone_number"],
    //             },
    //             guarantor2: {
    //                 name: value["guarantor2.name"],
    //                 email: value["guarantor2.email"],
    //                 phone_number: value["guarantor2.phone_number"],
    //             },
    //             createdByType,
    //             createdBy,
    //             processing_fee: processingFee,

    //         };

    //         const response = await LoanApplicationService.createLoanApplication(loanData, files);
    //         if (!response.success) {
    //             switch (response.code) {
    //                 case "NOT_FOUND":
    //                     return errorResponse(res, 404, response.message);

    //                 case "INVALID_AMOUNT":
    //                     return errorResponse(res, 400, response.message);

    //                 case "INTERNAL_ERROR":
    //                 default:
    //                     return errorResponse(res, 500, "An unexpected server error occurred", response);
    //             }
    //         }
    //         return successResponse(res, 201, "Loan application created successfully!", response);
    //     } catch (error) {
    //         console.error("Error creating loan application:", error);
    //         return errorResponse(res, 500, error.message);
    //     }
    // }


    static async sendOfferLetter(req, res){
        const { id, isStaff } = req.user;
        const { loanId } = req.params;//loan application id
        const { data } = req.body;
        try{
            const loanApp = await loanApplication.findById(loanId).populate('customer')
            console.log({loanApp});
            
            const offer_letter = await generateOfferLetter(data)
            await mailer.sendOfferLetter(
                loanApp.customer.email,
                loanApp.customer.first_name || loanApp.customer.business_name,
                loanApp.loan_id,
                offer_letter.buffer
            )
        } catch(error){
            console.error("Error sending offer letter:", error);
            return errorResponse(res, 500, "An unexpected server error occurred.");
        }
    }

    static async uploadOfferLetter(req, res) {
        const { id, isStaff } = req.user;
        const { identifier } = req.params; // Loan application ID
        const file = req.file;
    
        try {
            if (!file) {
                return errorResponse(res, 400, "No file was uploaded.");
            }
    
            const createdByType = isStaff ? "Staff" : "User";
            const createdBy = id;
    
            // Prep the offer letter data
            const offerLetterData = {
                letter: file.path, // Save the file path
                uploadedByType: createdByType,
                uploaded_by: createdBy,
            };
    
            const response = await LoanApplicationService.uploadOfferLetter(
                identifier,
                offerLetterData
            );
    
            if (!response.success) {
                return errorResponse(res, response.code || 500, response.message);
            }
    
            return successResponse(res, 200, "Offer letter uploaded successfully!", response.data);
        } catch (error) {
            console.error("Error uploading offer letter:", error);
            return errorResponse(res, 500, "An unexpected server error occurred.");
        }
    }


    static async uploadAdditionalDocument(req, res) {
        const { id, isStaff } = req.user;
        const { identifier } = req.params; // Loan application ID
        const file = req.file;
        const { document_name, notes } = req.body;
    
        try {
            if (!file) {
                return errorResponse(res, 400, "No file was uploaded.");
            }
    
            if (!document_name) {
                return errorResponse(res, 400, "A document name must be provided.");
            }
    
            const createdByType = isStaff ? "Staff" : "User";
            const createdBy = id;
    
            //prep the document data
            const documentData = {
                document_name: document_name || file.originalname, //use provided name or fallback to original file name
                document_url: file.path, //save the file path
                notes: notes || "", //optional notes
                uploadedByType: createdByType,
                uploaded_by: createdBy,
            };
    
            const response = await LoanApplicationService.uploadAdditionalDocument(
                identifier,
                documentData
            );
    
            if (!response.success) {
                return errorResponse(res, response.code || 500, response.message);
            }
    
            return successResponse(res, 200, "Document uploaded successfully!", response.data);
        } catch (error) {
            console.error("Error uploading additional document:", error);
            return errorResponse(res, 500, "An unexpected server error occurred.");
        }
    }

    static async createLoanApplication(req, res) {
        const { id, isStaff } = req.user;
        const { customerId } = req.params; // customer id
    
        const { loan_product, loan_amount, loan_duration, loan_type, business_financial, business_collateral } = req.body;
        const loanProductData =await AdminService.getProductsById(loan_product);
        const files = req.files;
        const cloudinaryResults = req.cloudinaryResults;
        try {
            const { error, value } = loanApplicationValidator.validate(req.body);
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }
    
            const fileError = validateRequiredFiles(files, loan_type);  // Ensure file validation is dependent on loan type
            if (fileError) {
                return errorResponse(res, 400, fileError);
            }

            const createdByType = isStaff ? "Staff" : "User";
            const createdBy = id;
            const processingFee = parseFloat(value.loan_amount) * 0.01;
    
            // Prepare loanData with additional fields for business loans
            const loanData = {
                customer: customerId,
                loan_product,
                loan_amount: parseFloat(value.loan_amount),
                loan_duration: parseInt(value.loan_duration, 10),
                loan_type: loanProductData.product_group, 
                loan_purpose: value.loan_purpose, 
                repayment_mode: value.repayment_mode, 
                guarantor1: {
                    name: value["guarantor1.name"],
                    email: value["guarantor1.email"],
                    phone_number: value["guarantor1.phone_number"],
                },
                guarantor2: {
                    name: value["guarantor2.name"],
                    email: value["guarantor2.email"],
                    phone_number: value["guarantor2.phone_number"],
                },
                createdByType,
                createdBy,
                processing_fee: processingFee,
                business_financial,  
                business_collateral, 
            };

            const response = await LoanApplicationService.createLoanApplication(loanData, cloudinaryResults);
            if (!response.success) {
                switch (response.code) {
                    case "NOT_FOUND":
                        return errorResponse(res, 404, response.message);
                    case "INVALID_AMOUNT":
                        return errorResponse(res, 400, response.message);
                    case "INVALID_DURATION":
                        return errorResponse(res, 400, response.message);
                    case "INTERNAL_ERROR":
                    default:
                        return errorResponse(res, 500, "An unexpected server error occurred", response);
                }
            }
    
            return successResponse(res, 201, "Loan application created successfully!", response);
        } catch (error) {
            console.error("Error creating loan application:", error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async updateLoanApplication(req, res) {
        const { id } = req.user;
        const { loanApplicationId } = req.params;
        const updateData = req.body;

        const { error } = updateLoanApplicationValidator.validate(updateData);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        if (!updateData.loan_duration && !updateData.loan_amount) {
            return errorResponse(
                res,
                400,
                "Please provide at least one field to update: 'Loan Duration' or 'Amount'."
            );
        }

        try {
            const result = await LoanApplicationService.updateLoanApplication(loanApplicationId, updateData, id);

            switch (result.code) {
                case "NOT_FOUND":
                    return errorResponse(res, 404, result.message);
                case "INVALID_DURATION":
                    return errorResponse(res, 400, result.message);
                case "SERVER_ERROR":
                    return errorResponse(res, 500, result.message);
                default:
                    break;
            }

            return successResponse(res, 200, "Loan application updated successfully", {
                loanApplication: result.loanApplication,
                repaymentPlan: result.repaymentPlan,
            });
        } catch (error) {
            console.error("Error updating loan application:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async getAllLoanApplication(req, res) {
        try {
          let filters = null
            if(req.user.role.permissions.includes("VIEW_CREATED_LOAN_APP") && !req.user.role.permissions.includes("VIEW_LOAN_APP") ){
                const userId = new mongoose.Types.ObjectId(req.user.id);
                filters = {
                    status: req.query.status,
                    search: req.query.search,
                    createdBy: userId,
                };
            } else {
                filters = {
                    status: req.query.status,
                    search: req.query.search,
                };
            }            
         

            const pagination = {
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 10,
            };

            const response = await LoanApplicationService.getAllLoanApplication(filters, pagination);

            return successResponse(
                res,
                200,
                "Loan applications returned successfully",
                response.data
            );
        } catch (error) {
            console.error("Error in getAllLoanApplication controller:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async getUserLoanApplications(req, res) {
        const { userId } = req.params;
        const { status, page, limit } = req.query;

        try {
            const filters = { status };
            const pagination = {
                page: parseInt(page, 10) || 1,
                limit: parseInt(limit, 10) || 10,
            };

            const response = await LoanApplicationService.getUserLoanApplications(userId, filters, pagination);

            if (!response.success) {
                return errorResponse(res, 500, response.message);
            }
            return successResponse(
                res,
                200,
                "Loan applications returned successfully",
                response.data
            );
        } catch (error) {
            console.error("Error fetching user loan applications:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async loanCalculator(req, res) {
        try {
            const { error, value } = loanCalculatorValidator.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, message: error.details[0].message });
            }

            const { loan_amount, duration, interest } = value;
            const result = calculateRepaymentPlan(loan_amount, duration, interest);
            return successResponse(res, 200, "Loan Calculated successfully", result);
        } catch (err) {
            console.error("Error in loan calculator:", err);
            return errorResponse(res, 500, "An unexpected error occurred.");
        }
    }

    static async calculatorLoan(req, res) {
        const { loan_product, loan_amount, loan_duration } = req.body;
        try {
            const { error, value } = loanApplicationCalcValidator.validate({
                loan_product,
                loan_amount,
                loan_duration,
            });
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }


            const processingFee = parseFloat(value.loan_amount) * 0.01;
            const loanData = {
                loan_product,
                loan_amount: parseFloat(loan_amount),
                loan_duration: parseInt(loan_duration, 10),
                processingFee
            };
            const response = await LoanApplicationService.calculateLoanApp(loanData);
            if (!response.success) {
                switch (response.code) {
                    case "NOT_FOUND":
                        return errorResponse(res, 404, response.message);

                    case "INVALID_AMOUNT":
                        return errorResponse(res, 400, response.message);

                    case "INTERNAL_ERROR":
                    default:
                        return errorResponse(res, 500, "An unexpected server error occurred", response);
                }
            }
            return successResponse(res, 200, "Preview loan application.", response);
        } catch (error) {
            console.error(error)
            return errorResponse(res, 500, "Server error");
        }
    }

    static async deleteLoanApplication(req, res) {
        const { id } = req.user;
        try {
            const { loanAppId } = req.params;

            const response = await LoanApplicationService.deleteLoanApplication(loanAppId, id);

            if (response.success) {
                return successResponse(res, 200, response.message);
            } else {
                return errorResponse(res, 404, response.message);
            }
        } catch (error) {
            console.error("Error in deleteLoanApplication controller:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async getLoanApplication(req, res) {
        const { identifier } = req.params;

        try {
            const result = await LoanApplicationService.getLoanApplicationByIdOrLoanId(identifier);
            if (!result.success) {
                const statusCode = result.code === "NOT_FOUND" ? 404 : 500;
                return errorResponse(res, statusCode, result.message);
            }

            const guarantorResponse = await GuarantorsDataService.getGuarantorsByLoanApplicationId(identifier);
            
            const guarantors = [
                result.guarantor1?.guarantor || null,
                result.guarantor2?.guarantor || null,
            ].filter(Boolean);

           // guarantorResponse.guarantorResponse = guarantorResponse.guarantors

            return successResponse(res, 200, "Loan application retrieved successfully", {
                loanApplication: result.loanApplication,
                guarantors,
                activityLog: result.appActivity,
                approval: result.approvals,
                guarantorResponse: guarantorResponse.guarantors
            }); 
        } catch (error) {
            console.error("Error in getLoanApplication controller:", error);
            return errorResponse(res, 500, "An unexpected server error occurred");
        }
    }

    static async getUserLoans(req, res) {
        const userId = req.params.userId;
        const { status } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
    
        try {
            const response = await LoanApplicationService.getUserLoansWithActivity(userId, { status }, { page, limit });
            if (response.success) {
                return successResponse(res, 200, "Loans with activity fetched successfully", response.data);
            }
            return errorResponse(res, 400, response.message);
        } catch (error) {
            console.error("Error fetching loans with activity:", error);
            return errorResponse(res, 500, "Server error while fetching loans with activity");
        }
    }

    static async userLoanSummary(req, res){
        try {
            const { userId } = req.params;
            if (!userId) {
                return errorResponse(res, 400, "User ID is required");
            }
            const result = await LoanApplicationService.userLoanSummary(userId);
    
            if (result.success) {
                return successResponse(res, 200, "User Loan Summary", result.data)
            } else {
                return errorResponse(res, 500, result.message)
            }
        } catch (error) {
            console.error("Error in userLoanSummary controller:", error);
            return errorResponse(res, 500, "Server error");
        }
    };

    static async getAllRepaymentsForUser(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const response = await LoanApplicationService.fetchAllRepaymentsForUser(userId, Number(page), Number(limit));
            if (!response.success) {
                return errorResponse(res, 500, response.message);
            }

            return successResponse(res, 200, response.message, response.data);
        } catch (error) {
            console.error("Error in getAllRepaymentsForUser:", error);
            return errorResponse(res, 500, "Failed to fetch repayments");
        }
    }

    static async getRepaymentsForLoanApplication(req, res) {
        try {
            const { loanApplicationId } = req.params;

            const response = await LoanApplicationService.fetchRepaymentsForLoanApplication(loanApplicationId);
            if (!response.success) {
                return errorResponse(res, 500, response.message);
            }

            return successResponse(res, 200, response.message, response.data);
        } catch (error) {
            console.error("Error in getRepaymentsForLoanApplication:", error);
            return errorResponse(res, 500, "Failed to fetch repayments");
        }
    }

    static async getAllRepayments(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const response = await LoanApplicationService.fetchAllRepayments(Number(page), Number(limit));
            if (!response.success) {
                return errorResponse(res, 500, response.message);
            }

            return successResponse(res, 200, response.message, response.data);
        } catch (error) {
            console.error("Error in getAllRepayments:", error);
            return errorResponse(res, 500, "Failed to fetch repayments");
        }
    }

    static async disburseLoan(req, res){
        try {
            const { id } = req.params;
    
            const response = await LoanApplicationService.disburseLoan(id);
    
            if (!response.success) {
                switch (response.code) {
                    case "NOT_FOUND":
                        return errorResponse(res, 404, response.message);
                    case "INVALID_STATUS":
                        return errorResponse(res, 400, response.message);
                    case "INTERNAL_ERROR":
                    default:
                        return errorResponse(res, 500, "An unexpected server error occurred", response);
                }
            }
    
            return successResponse(res, 200, response.message, response.loanApplication);
        } catch (error) {
            console.error("Error disbursing loan:", error);
            return errorResponse(res, 500, "An unexpected server error occurred");
        }
    };
}
