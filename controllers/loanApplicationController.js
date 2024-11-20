const LoanApplicationService = require("../services/loanApplicationService");
const { successResponse, errorResponse } = require("../utils/responses");


module.exports = class LoanApplicationController{
    static async createLoanApplication(req, res) {
        const { userId } = req.params;
        const { loan_product, loan_amount, loan_duration } = req.body;
        const files = req.files;

        try {
            if (!userId) {
                return errorResponse(res, 400, "Customer ID is required.");
            }
            if (!loan_product) {
                return errorResponse(res, 400, "Loan product is required.");
            }
            if (!loan_amount) {
                return errorResponse(res, 400, "Loan amount is required.");
            }
            if (!loan_duration) {
                return errorResponse(res, 400, "Loan duration is required.");
            }

            if (!files || Object.keys(files).length === 0) {
                return errorResponse(res, 400, "Required files are missing.");
            }
            const requiredGuarantorFiles = [
                "guarantor.kyc_guarantor_form",
                "guarantor.passport_form",
                "guarantor.statement_of_net_worth",
                "guarantor.security_cheque",
            ];
            const missingGuarantorFiles = requiredGuarantorFiles.filter(
                (key) => !files[key] || !files[key][0]?.path
            );

            if (missingGuarantorFiles.length > 0) {
                return errorResponse(
                    res,
                    400,
                    `Missing required guarantor files: ${missingGuarantorFiles.join(", ")}`
                );
            }

            if (!files["statement_of_account"] || !files["statement_of_account"][0]?.path) {
                return errorResponse(res, 400, "Statement of account is required.");
            }
            const loanData = {
                loan_product,
                loan_amount: parseFloat(loan_amount),
                loan_duration: parseInt(loan_duration, 10),
            };

            const result = await LoanApplicationService.createLoanApplication(userId, loanData, files);

            if (!result.success) {
                return errorResponse(res, 400, result.message);
            }

            return successResponse(res, 201, result.message, result.data);
        } catch (error) {
            console.error("Error creating loan application:", error);
            return errorResponse(res, 500, error.message);
        }
    }

}