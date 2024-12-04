const LoanApplication = require('../models/loanApplication');
const User = require("../models/user");
const LoanProduct = require("../models/loanProduct");
const { calculateRepaymentPlan } = require("../helpers/calcRepayment.helper");
const Repayment = require('../models/repayment');

module.exports = class LoanApplicationService{
    static async createLoanApplication(customerId, loanData, files) {
        try {
            const loanProduct = await LoanProduct.findById(loanData.loan_product);
            if (!loanProduct) {
                return {
                    success: false,
                    message: "Loan product not found",
                    code: "NOT_FOUND",
                };
            }
            const compare = loanData.loan_amount < loanProduct.min || loanData.loan_amount > loanProduct.max;
            if (compare === true) {
                return {
                    success: false,
                    message: `Loan amount for ${loanProduct.name} must be between ${loanProduct.min} and ${loanProduct.max}`,
                    code: "INVALID_AMOUNT",
                };
            }
            const interestRate = loanProduct.interest;
            const repaymentPlan = calculateRepaymentPlan(loanData.loan_amount, loanData.loan_duration, interestRate);
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
                code: "INTERNAL_ERROR",
            };
        }
    }


    static async updateLoanApplication(loanApplicationId, updateData) {
        try {
            const loanApplication = await LoanApplication.findById(loanApplicationId).populate('loan_product');
            if (!loanApplication) {
                return { success: false, message: "Loan application not found", code: "NOT_FOUND" };
            }

            if (updateData.status === "approved" && loanApplication.status !== "approved") {
                const currentDate = new Date();
                loanApplication.status = "approved";
                loanApplication.date_disbursed = currentDate;

                // Generate repayments
                const repaymentCount = updateData.loan_duration || loanApplication.loan_duration;
                const repayments = [];
                const lastRepayment = await Repayment.findOne().sort({ repayment_id: -1 });
                let lastRepaymentId = lastRepayment ? parseInt(lastRepayment.repayment_id.slice(4)) : 123;

                for (let i = 0; i < repaymentCount; i++) {
                    const repaymentId = `CWRP${++lastRepaymentId}`;
                    const dueDate = new Date(currentDate);
                    dueDate.setMonth(dueDate.getMonth() + i + 1);

                    const repayment = new Repayment({
                        repayment_id: repaymentId,
                        due_date: dueDate,
                    });
                    await repayment.save();
                    repayments.push(repayment._id);
                }

                loanApplication.repayments = repayments;
            }

            if (updateData.loan_duration) {
                if (updateData.loan_duration <= 0) {
                    return { success: false, message: "Loan duration must be greater than 0.", code: "INVALID_DURATION" };
                }

                const loanProduct = loanApplication.loan_product;
                const repaymentPlan = calculateRepaymentPlan(
                    loanApplication.loan_amount,
                    updateData.loan_duration,
                    loanProduct.interest
                );

                loanApplication.loan_duration = updateData.loan_duration;
                loanApplication.repayment_plan = repaymentPlan;
            }

            await loanApplication.save();
            const updatedLoanApplication = await LoanApplication.findById(loanApplication._id)
            .populate('loan_product')
            .populate('repayments');

            return {
                success: true,
                loanApplication: updatedLoanApplication,
                repaymentPlan: loanApplication.repayment_plan || null,
            };
        } catch (error) {
            console.error("Error updating loan application:", error);
            return {
                success: false,
                message: "An unexpected error occurred while updating the loan application.",
                code: "SERVER_ERROR",
            };
        }
    }

    //for admin to get all loanApplication
    static async getAllLoanApplication(filters, pagination) {
        try {
            const { status } = filters;
            const { page = 1, limit = 10 } = pagination;

            const query = {};
            if (status) {
                query.status = status;
            }

            const skip = (page - 1) * limit;

            const loanApplications = await LoanApplication.find(query)
                .populate('customer', 'first_name last_name email phone_number')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const totalApplications = await LoanApplication.countDocuments(query);
            const totalPages = Math.ceil(totalApplications / limit);

            const paginationLinks = {
                first: `/loan-apps?page=1&limit=${limit}${status ? `&status=${status}` : ''}`,
                prev: page > 1 
                    ? `/loan-apps?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ''}` 
                    : null,
                next: page < totalPages 
                    ? `/loan-apps?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ''}` 
                    : null,
                last: `/loan-apps?page=${totalPages}&limit=${limit}${status ? `&status=${status}` : ''}`,
            };

            return {
                success: true,
                data: {
                    loanApplications,
                    total: totalApplications,
                    currentPage: page,
                    totalPages: totalPages,
                    paginationLinks: paginationLinks,
                },
            };
        } catch (error) {
            console.error("Error fetching loan applications:", error);
            return {
                success: false,
                message: "Could not fetch loan applications",
            };
        }
    }

    static async getUserLoanApplications(userId, filters, pagination) {
        try {
            const { status } = filters;
            const { page = 1, limit = 10 } = pagination;

            const query = { customer: userId };
            if (status) {
                query.status = status;
            }

            const skip = (page - 1) * limit;

            const loanApplications = await LoanApplication.find(query)
                .populate("loan_product", "name interest desc")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const totalApplications = await LoanApplication.countDocuments(query);
            const totalPages = Math.ceil(totalApplications / limit);

            const paginationLinks = {
                first: `/loans/${userId}?page=1&limit=${limit}${status ? `&status=${status}` : ''}`,
                prev: page > 1 
                    ? `/loans/${userId}?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ''}` 
                    : null,
                next: page < totalPages 
                    ? `/loans/${userId}?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ''}` 
                    : null,
                last: `/loans/${userId}?page=${totalPages}&limit=${limit}${status ? `&status=${status}` : ''}`,
            };

            return {
                success: true,
                data: {
                    loanApplications,
                    total: totalApplications,
                    currentPage: page,
                    totalPages: totalPages,
                    paginationLinks: paginationLinks,
                },
            };
        } catch (error) {
            console.error("Error fetching loan applications:", error);
            return {
                success: false,
                message: "Could not fetch loan applications",
            };
        }
    }

    static async calculateLoanApp(loanData){
        try{
            const loanProduct = await LoanProduct.findById(loanData.loan_product);
            if(!loanProduct){
                return {
                    success: false,
                    message: "Loan product not found",
                    code: "NOT_FOUND",
                };
            }
            const compare = loanData.loan_amount < loanProduct.min || loanData.loan_amount > loanProduct.max;
            if (compare === true) {
                return {
                    success: false,
                    message: `Loan amount for ${loanProduct.name} must be between ${loanProduct.min} and ${loanProduct.max}`,
                    code: "INVALID_AMOUNT",
                };
            }
            const interestRate = loanProduct.interest;
            const repaymentPlan = calculateRepaymentPlan(loanData.loan_amount, loanData.loan_duration, interestRate);
            return {
                success: true,
                repaymentPlan,
            };
        }catch(error){
            return{
                success: false,
                message: "Error Calculating Loan Data",
            };
        }
    }
}