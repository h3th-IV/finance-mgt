const LoanApplicationService = require("../services/loanApplicationService");
const { successResponse, errorResponse } = require("../utils/responses");
const { loanApplicationValidator, updateLoanApplicationValidator, loanApplicationCalcValidator } = require("../validators/loanApplication.validator");
const { validateRequiredFiles } = require('../helpers/validateFiles.helper');
const { loanCalculatorValidator } = require('../validators/loanCalc.validator');
const { calculateRepaymentPlan } = require('../helpers/calcRepayment.helper');

module.exports = class LoanApplicationController {
    static async createLoanApplication(req, res) {
        const { userId } = req.params;
        console.log({userId});
        
        const { loan_product, loan_amount, loan_duration } = req.body;
        const files = req.files;
        console.log({files});
        

        try {
            const { error, value } = loanApplicationValidator.validate(
              req.body
            );

            console.log({value});
            
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }

            const fileError = validateRequiredFiles(files);
            if (fileError) {
                return errorResponse(res, 400, fileError);
            }

            const loanData = {
                loan_product,
                loan_amount: parseFloat(value.loan_amount),
                loan_duration: parseInt(value.loan_duration, 10),
                guarantor1: {
                    name: value["guarantor1.name"],
                    email: value["guarantor1.email"],
                },
                guarantor2: {
                    name: value["guarantor2.name"],
                    email: value["guarantor2.email"],
                }
            };
            console.log({ userId, loanData, files });

            const response = await LoanApplicationService.createLoanApplication(userId, loanData, files);
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
            return successResponse(res, 201, "Loan application created successfully!", response);
        } catch (error) {
            console.error("Error creating loan application:", error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async updateLoanApplication(req, res) {
        const { loanApplicationId } = req.params;
        const updateData = req.body;

        const { error } = updateLoanApplicationValidator.validate(updateData);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        if (!updateData.loan_duration && !updateData.status) {
            return errorResponse(
                res,
                400,
                "Please provide at least one field to update: 'Loan Duration' or 'Status'."
            );
        }
        try {
            const result = await LoanApplicationService.updateLoanApplication(loanApplicationId, updateData);

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
            const filters = {
                status: req.query.status,
                search: req.query.search, // Add search parameter
            };

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
            const { error } =  loanApplicationCalcValidator.validate({
                loan_product,
                loan_amount,
                loan_duration,
            });
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }

            const loanData = {
                loan_product,
                loan_amount: parseFloat(loan_amount),
                loan_duration: parseInt(loan_duration, 10),
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
            return errorResponse(res, 500, "Server error");
        }
    }
}

