const LoanApplication = require('../models/loanApplication');
const User = require("../models/user");
const LoanProduct = require("../models/loanProduct");

module.exports = class LoanApplicationService{
    static async createLoanApplication(customerId, loanData, files) {
        try {
            const loanProduct = await LoanProduct.findById(loanData.loan_product);
            if (!loanProduct) {
                return {
                    success: false,
                    message: "Loan product not found",
                };
            }

            if (loanData.loan_amount < loanProduct.min || loanData.loan_amount > loanProduct.max) {
                return {
                    success: false,
                    message: `Loan amount for the loan product you have selected must be between ${loanProduct.min} and ${loanProduct.max}`,
                };
            }

            const interestRate = loanProduct.interest;
            const monthlyInterest = (interestRate / 100) * loanData.loan_amount;
            const monthlyRepayment = loanData.loan_amount / loanData.loan_duration + monthlyInterest;

            const guarantor = {
                kyc_guarantor_form: files["guarantor.kyc_guarantor_form"]?.[0]?.path || null,
                passport_form: files["guarantor.passport_form"]?.[0]?.path || null,
                statement_of_net_worth: files["guarantor.statement_of_net_worth"]?.[0]?.path || null,
                security_cheque: files["guarantor.security_cheque"]?.[0]?.path || null,
            };

            const statementOfAccount = files["statement_of_account"]?.[0]?.path || null;

            const loanApplication = new LoanApplication({
                customer: customerId,
                loan_id: `CWLN-${Date.now()}`,
                loan_product: loanData.loan_product,
                interest_rate: interestRate,
                loan_amount: loanData.loan_amount,
                loan_duration: loanData.loan_duration,
                statement_of_account: statementOfAccount,
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
            return {
                success: false,
                message: `Error: ${error.message}`,
            };
        }
    }
}