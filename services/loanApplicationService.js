const LoanApplication = require('../models/loanApplication');
const User = require("../models/user");
const LoanProduct = require("../models/loanProduct");
const { calculateRepaymentPlan } = require("../helpers/calcRepayment.helper");

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
            console.log("here oop");
            console.log("Loan amount: ", loanData.loan_amount, typeof loanData.loan_amount);
            console.log("Min: ", loanProduct.min, typeof loanProduct.min);
            console.log("Max: ", loanProduct.max, typeof loanProduct.max);
            if (loanData.loan_amount < loanProduct.min || loanData.loan_amount > loanProduct.max) {
                return {
                    success: false,
                    message: `Loan amount for ${loanProduct.name} must be between ${loanProduct.min} and ${loanProduct.max}`,
                };
            }
            console.log("thath")
            const interestRate = loanProduct.interest;
            const repaymentPlan = calculateRepaymentPlan(loanData.loan_amount, loanData.loan_duration, interestRate);
            console.log("interestRate: ", interestRate);
            console.log("repaymentPlan: ", repaymentPlan);
            const guarantor = {
                kyc_guarantor_form: files["guarantor.kyc_guarantor_form"]?.[0]?.path || null,
                passport_form: files["guarantor.passport_form"]?.[0]?.path || null,
                statement_of_net_worth: files["guarantor.statement_of_net_worth"]?.[0]?.path || null,
                security_cheque: files["guarantor.security_cheque"]?.[0]?.path || null,
            };

            const statementOfAccount = files["statement_of_account"]?.[0]?.path || null;
            console.log("here service 2");
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
                repayment_plan: repaymentPlan,
            });

            await loanApplication.save();
            return {
                success: true,
                loanApplication,
                repaymentPlan,
            };
        } catch (error) {
            return {
                success: false,
                message: `Error: ${error.message}`,
            };
        }
    }

    static async updateLoanApplication(loanApplicationId, updateData) {
        try {
            const loanApplication = await LoanApplication.findById(loanApplicationId).populate('loan_product');
            if (!loanApplication) {
                return { success: false, message: "Loan application not found" };
            }

            if (updateData.loan_duration) {
                const loanProduct = loanApplication.loan_product;

                if (updateData.loan_duration <= 0) {
                    return { success: false, message: "Loan duration must be greater than 0." };
                }

                // Update loan_duration and recalculate repayment plan
                loanApplication.loan_duration = updateData.loan_duration;
                const repaymentPlan = calculateRepaymentPlan(loanApplication.loan_amount, loanApplication.loan_duration, loanProduct.interest);

                loanApplication.repayment_plan = repaymentPlan;
            }
            if (updateData.status) {
                loanApplication.status = updateData.status;
            }
            await loanApplication.save();
            return { 
                success: true, 
                loanApplication, 
                repaymentPlan: loanApplication.repayment_plan || null
            };
        } catch (error) {
            console.error("Error updating loan application:", error);
            throw new Error("Could not update loan application");
        }
    }

    static async getAllLoanApplication(){
        try{
            const loanApps = await LoanApplication.find();
            return loanApps;
        } catch(error) {    
            return error;
        }
    }
}