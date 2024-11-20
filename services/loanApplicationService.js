const LoanApplication = require('../models/loanApplication');
const User = require("../models/user");
const LoanProduct = require("../models/loanProduct");

module.exports = class LoanApplicationService{
    static async createLoanApplication(customerId, loanData, guarantorFiles) {
        try {
            // Fetch loan product to calculate interest
            const loanProduct = await LoanProduct.findById(loanData.loan_product);
            if (!loanProduct) {
                throw new Error("Loan product not found");
            }

            const interestRate = loanProduct.interest;
            const monthlyInterest = (interestRate / 100) * loanData.loan_amount;
            const monthlyRepayment = loanData.loan_amount / loanData.loan_duration + monthlyInterest;

            const guarantor = {
                kyc_guarantor_form: guarantorFiles["guarantor.kyc_guarantor_form"]?.[0]?.path || null,
                passport_form: guarantorFiles["guarantor.passport_form"]?.[0]?.path || null,
                statement_of_net_worth: guarantorFiles["guarantor.statement_of_net_worth"]?.[0]?.path || null,
                security_cheque: guarantorFiles["guarantor.security_cheque"]?.[0]?.path || null,
            };

            const loanApplication = new LoanApplication({
                customer: customerId,
                loan_id: `LN-${Date.now()}`,
                loan_product: loanData.loan_product,
                interest_rate: interestRate,
                loan_amount: loanData.loan_amount,
                loan_duration: loanData.loan_duration,
                statement_of_account: loanData.statement_of_account,
                guarantor,
                date_disbursed: loanData.date_disbursed || null,
            });

            await loanApplication.save();

            return {
                loanApplication,
                repaymentPlan: {
                    monthlyRepayment: monthlyRepayment.toFixed(2),
                    totalRepayment: (monthlyRepayment * loanData.loan_duration).toFixed(2),
                },
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}