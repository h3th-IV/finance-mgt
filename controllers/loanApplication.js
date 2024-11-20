const LoanApplicationService = require("../services/loanApplicationService");
const { successResponse, errorResponse } = require("../utils/responses");


module.exports = class LoanApplicationController{
    static async createLoanApplication(req, res) {
        const { userId } = req.params;
        const { loan_product, loan_amount, loan_duration, statement_of_account } = req.body;
        const guarantorFiles = req.files;

        try {
            const loanData = {
                loan_product,
                loan_amount: parseFloat(loan_amount),
                loan_duration: parseInt(loan_duration, 10),
                statement_of_account,
            };

            const { loanApplication, repaymentPlan } = await LoanService.createLoanApplication(userId, loanData, guarantorFiles);

            return successResponse(res, 201, "Loan application created successfully", {
                loanApplication,
                repaymentPlan,
            });
        } catch (error) {
            console.error("Error creating loan application:", error);
            return errorResponse(res, 500, error.message);
        }
    }
}