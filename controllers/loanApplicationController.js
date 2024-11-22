const LoanApplicationService = require("../services/loanApplicationService");
const { successResponse, errorResponse } = require("../utils/responses");
const { loanApplicationValidator, updateLoanApplicationValidator } = require("../validators/loanApplication.validator");

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

            const { loanApplication, repaymentPlan } =
                await LoanApplicationService.createLoanApplication(userId, loanData, files);

            if (!loanApplication || !repaymentPlan) {
                return errorResponse(res, 500, "Failed to create loan application. Please try again.");
            }
            return successResponse(res, 201, "Loan application created successfully!", {
                loanApplication,
                repaymentPlan,
            });
        } catch (error) {
            console.error("Error creating loan application:", error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async updateLoanApplication(req, res) {
        const { loanApplicationId } = req.params;
        const { loan_duration, status } = req.body;

        if (!loan_duration && !status) {
            return errorResponse(res, 400, "Please provide at least one field to update: 'loan_duration' or 'status'.");
        }

        try {
            const updateData = {};
            if (loan_duration) updateData.loan_duration = loan_duration;
            if (status) updateData.status = status;

            const result = await LoanApplicationService.updateLoanApplication(loanApplicationId, updateData);

            if (!result.success) {
                return errorResponse(res, 404, result.message);
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

const validateRequiredFiles = (files) => {
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
        return `Missing required guarantor files: ${missingGuarantorFiles.join(", ")}`;
    }

    if (!files["statement_of_account"] || !files["statement_of_account"][0]?.path) {
        return "Statement of account is required.";
    }

    return null;
};
