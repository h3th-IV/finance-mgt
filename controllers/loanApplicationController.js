const LoanApplicationService = require("../services/loanApplicationService");
const { successResponse, errorResponse } = require("../utils/responses");
const { loanApplicationValidator, updateLoanApplicationValidator } = require("../validators/loanApplication.validator");
const { validateRequiredFiles } = require('../helpers/validateFiles.helper');

module.exports = class LoanApplicationController{
    static async createLoanApplication(req, res) {
        const { userId } = req.params;
        const { loan_product, loan_amount, loan_duration } = req.body;
        const files = req.files;

        try {
            const { error } = loanApplicationValidator.validate({
                loan_product,
                loan_amount,
                loan_duration,
            });
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }

            const fileError = validateRequiredFiles(files);
            if (fileError) {
                return errorResponse(res, 400, fileError);
            }

            const loanData = {
                loan_product,
                loan_amount: parseFloat(loan_amount),
                loan_duration: parseInt(loan_duration, 10),
            };

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
                "Please provide at least one field to update: 'loan_duration' or 'status'."
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

    static async getAllLoanApplication(req, res){
        try{
            const response = await LoanApplicationService.getAllLoanApplication();
            return successResponse(res, 200, "Loan applications returned successfully", response);
        } catch(error) {
            return errorResponse(res, 500, "Server error");
        }
    }
}

