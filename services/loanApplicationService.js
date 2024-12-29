const LoanApplication = require("../models/loanApplication");
const User = require("../models/user");
const LoanProduct = require("../models/loanProduct");
const { calculateRepaymentPlan } = require("../helpers/calcRepayment.helper");
const Repayment = require("../models/repayment");
const { sendGuarantorMail } = require("../config/mailer");
const { default: mongoose } = require("mongoose");

module.exports = class LoanApplicationService {
  static async createLoanApplication(loanData, files) {
    try {        
      const loanProduct = await LoanProduct.findById(loanData.loan_product);
      if (!loanProduct) {
        return {
          success: false,
          message: "Loan product not found",
          code: "NOT_FOUND",
        };
      }

      const compare =
        loanData.loan_amount < loanProduct.min ||
        loanData.loan_amount > loanProduct.max;
      if (compare) {
        return {
          success: false,
          message: `Loan amount for ${loanProduct.name} must be between ${loanProduct.min} and ${loanProduct.max}`,
          code: "INVALID_AMOUNT",
        };
      }

      const isValidDuration = loanProduct.duration.includes(loanData.loan_duration);
      if (!isValidDuration) {
          return {
              success: false,
              message: `Invalid loan duration. Allowed durations for ${loanProduct.name} are: ${loanProduct.duration.join(", ")} months.`,
              code: "INVALID_DURATION",
          };
      }

      const lastLoan = await LoanApplication.findOne({}, { loan_id: 1 })
        .sort({ createdAt: -1 })
        .limit(1);

      let newLoanId = "CWLN-1024";
      if (lastLoan && lastLoan.loan_id) {
        const lastLoanNumber = parseInt(lastLoan.loan_id.split("-")[1], 10);
        newLoanId = `CWLN-${lastLoanNumber + 1}`;
      }

      // Calculate repayment plan
      const repaymentPlan = calculateRepaymentPlan(
        loanData.loan_amount,
        loanData.loan_duration,
        loanProduct.interest,
        loanProduct.interest_type,
        loanData.processing_fee
      );

      // Process uploaded files
      const statementOfAccount =
        files["statement_of_account"]?.[0]?.path || null;
      const statementOfNetWorth =
        files["statement_of_net_worth"]?.[0]?.path || null;
      const securityCheque = files["security_cheque"]?.[0]?.path || null;

      const loanApplication = new LoanApplication({
        ...loanData,
        loan_id: newLoanId,
        interest_rate: loanProduct.interest,
        statement_of_account: statementOfAccount,
        statement_of_net_worth: statementOfNetWorth,
        security_cheque: securityCheque,
        date_disbursed: loanData.date_disbursed || null,
        repayment_plan: repaymentPlan,
      });

      const x = await loanApplication.save();
      const _loanApplication = await LoanApplication.findById(x._id).populate("customer", "name").populate("loan_product", "name");        

      // Send emails to guarantors
      await Promise.all([
        // Call sendGuarantorMail for guarantor1
        sendGuarantorMail(
          _loanApplication.guarantor1.email,
          _loanApplication.guarantor1.name,
          _loanApplication.customer.name,
          {
            loanProduct: _loanApplication.loan_product.name,
            loanAmount: _loanApplication.loan_amount,
            loanDuration: _loanApplication.loan_duration,
          }
        ),

        // Call sendGuarantorMail for guarantor2
        sendGuarantorMail(
          _loanApplication.guarantor2.email,
          _loanApplication.guarantor2.name,
          _loanApplication.customer.name,
          {
            loanProduct: _loanApplication.loan_product.name,
            loanAmount: _loanApplication.loan_amount,
            loanDuration: _loanApplication.loan_duration,
          }
        ),
      ]);

      return {
        success: true,
        loanApplication,
        repaymentPlan,
      };
    } catch (error) {
      console.error('Error creating loan application',error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async updateLoanApplication(loanApplicationId, updateData) {
    try {
        const loanApplication = await LoanApplication.findById(loanApplicationId).populate("loan_product");
        if (!loanApplication) {
            return {
                success: false,
                message: "Loan application not found",
                code: "NOT_FOUND",
            };
        }
        const loanProduct = loanApplication.loan_product;
        if(updateData.loan_duration){
          if(!loanProduct.duration.includes(updateData.loan_duration)){
            return {
              success: false,
              message: `Invalid loan duration. Allowed durations for ${loanProduct.name} are: ${loanProduct.duration.join(", ")} months.`,
              code: "INVALID_DURATION",}
          }

          if (updateData.loan_duration <= 0) {
            return {
                success: false,
                message: "Loan duration must be greater than 0.",
                code: "INVALID_DURATION",
            };
          }
          loanApplication.loan_duration = updateData.loan_duration;

            // Recalculate repayment plan
          const repaymentPlan = calculateRepaymentPlan(
              loanApplication.loan_amount,
              updateData.loan_duration,
              loanProduct.interest,
              loanProduct.interest_type,
              loanApplication.processing_fee
            );

            loanApplication.repayment_plan = repaymentPlan;
        }
        if (updateData.status === "approved" && loanApplication.status !== "approved") {
            const currentDate = new Date();
            loanApplication.status = "approved";
            loanApplication.date_disbursed = currentDate;

            //gen repayment plan
            const loanDuration = updateData.loan_duration || loanApplication.loan_duration;

            const repaymentPlan = calculateRepaymentPlan(
                loanApplication.loan_amount,
                loanDuration,
                loanProduct.interest,
                loanProduct.interest_type,
                loanApplication.processing_fee
            );
            const repayments = [];
            const lastRepayment = await Repayment.findOne().sort({ repayment_id: -1 });
            let lastRepaymentId = lastRepayment ? parseInt(lastRepayment.repayment_id.slice(4)) : 123;

            if (loanProduct.interest_type === "flat_rate") {
              const monthlyPayment = parseFloat(repaymentPlan.monthlyPayment);
              const monthlyPrincipal = parseFloat(repaymentPlan.totalCapital) / loanDuration;
              const monthlyInterest = parseFloat(repaymentPlan.totalInterest) / loanDuration;
          
              for (let i = 0; i < loanDuration; i++) {
                  const repaymentId = `CWRP${++lastRepaymentId}`;
                  const dueDate = new Date(currentDate);
                  dueDate.setMonth(dueDate.getMonth() + i + 1);
          
                  const repayment = new Repayment({
                      repayment_id: repaymentId,
                      principal: monthlyPrincipal,
                      interest: monthlyInterest,
                      amount: monthlyPayment,
                      due_date: dueDate,
                  });
          
                  await repayment.save();
                  repayments.push(repayment._id);
                }
            } else if (loanProduct.interest_type === "reducing_balance") {
              for (const [index, schedule] of repaymentPlan.repaymentSchedule.entries()) {
                const repaymentId = `CWRP${++lastRepaymentId}`;
                const dueDate = new Date(currentDate);
                dueDate.setMonth(dueDate.getMonth() + index + 1);
        
                const repayment = new Repayment({
                    repayment_id: repaymentId,
                    principal: parseFloat(schedule.principal),
                    remaining_principal: parseFloat(schedule.remainingPrincipal),
                    interest: parseFloat(schedule.interest),
                    amount: parseFloat(schedule.payment),
                    due_date: dueDate,
                });
                await repayment.save();
                repayments.push(repayment._id);
              }
            }

            loanApplication.repayments = repayments;
            loanApplication.repayment_plan = repaymentPlan;
        }

        await loanApplication.save();
        const updatedLoanApplication = await LoanApplication.findById(loanApplication._id).populate("loan_product").populate("repayments");

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


    static async getAllLoanApplication(filters, pagination) {
      const { status, search } = filters;
      const { page = 1, limit = 10 } = pagination;

      try {
          const queryFilter = {};

          if (status) {
              queryFilter.status = status;
          }

         
          const searchRegex = search ? new RegExp(search, "i") : null;

         
          const skip = (page - 1) * limit;

         
          const loanApplications = await LoanApplication.find(queryFilter)
              .populate({
                  path: "customer",
                  match: searchRegex
                      ? {
                            $or: [
                                { first_name: searchRegex },
                                { last_name: searchRegex },
                                { phone_number: searchRegex },
                                { email: searchRegex },
                            ],
                        }
                      : {}, //nein filtering if search is not provided
              })
              .skip(skip)
              .limit(limit)
              .sort({ createdAt: -1 });

          //filter out loan applications with null `customer` due to the `math` filter
          const filteredApplications = loanApplications.filter(
              (app) => app.customer
          );

          const totalApplications = await LoanApplication.countDocuments(queryFilter);
          // await LoanApplication.deleteMany();

          const totalPages = Math.ceil(totalApplications / limit);

          const paginationLinks = {
              first: `/loan-apps?page=1&limit=${limit}${
                  status ? `&status=${status}` : ""
              }${search ? `&search=${search}` : ""}`,
              prev:
                  page > 1
                      ? `/loan-apps?page=${page - 1}&limit=${limit}${
                            status ? `&status=${status}` : ""
                        }${search ? `&search=${search}` : ""}`
                      : null,
              next:
                  page < totalPages
                      ? `/loan-apps?page=${page + 1}&limit=${limit}${
                            status ? `&status=${status}` : ""
                        }${search ? `&search=${search}` : ""}`
                      : null,
              last: `/loan-apps?page=${totalPages}&limit=${limit}${
                  status ? `&status=${status}` : ""
              }${search ? `&search=${search}` : ""}`,
          };

          return {
              success: true,
              data: {
                  loanApplications: filteredApplications,
                  links: {
                      first: paginationLinks.first,
                      prev: paginationLinks.prev,
                      next: paginationLinks.next,
                      last: paginationLinks.last,
                      currentPage: page,
                      totalPages: totalPages,
                      totalPerPage: limit,
                      total: totalApplications,
                  },
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
    const { status } = filters;
    const { page = 1, limit = 10 } = pagination;
    try {

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
        first: `/loans/${userId}?page=1&limit=${limit}${
          status ? `&status=${status}` : ""
        }`,
        prev:
          page > 1
            ? `/loans/${userId}?page=${page - 1}&limit=${limit}${
                status ? `&status=${status}` : ""
              }`
            : null,
        next:
          page < totalPages
            ? `/loans/${userId}?page=${page + 1}&limit=${limit}${
                status ? `&status=${status}` : ""
              }`
            : null,
        last: `/loans/${userId}?page=${totalPages}&limit=${limit}${
          status ? `&status=${status}` : ""
        }`,
      };

      return {
                success: true,
                data: {
                    loanApplications,
                    links: {
                        first: paginationLinks.first,
                        prev: paginationLinks.prev,
                        next: paginationLinks.next,
                        last: paginationLinks.last,
                        currentPage: page,
                        totalPages: totalPages,
                        totalPerPage: limit,
                        total: totalApplications,
                    },
                },
            };
    } catch (error) {
      console.error("Error fetching user's loan applications:", error);
      return {
        success: false,
        message: "Could not fetch loan applications",
      };
    }
  }


  static async calculateLoanApp(loanData) {
    try {
        const loanProduct = await LoanProduct.findById(loanData.loan_product);
        if (!loanProduct) {
            return {
                success: false,
                message: "Loan product not found",
                code: "NOT_FOUND",
            };
        }
        if (
            loanData.loan_amount < loanProduct.min ||
            loanData.loan_amount > loanProduct.max
        ) {
            return {
                success: false,
                message: `Loan amount for ${loanProduct.name} must be between ${loanProduct.min} and ${loanProduct.max}`,
                code: "INVALID_AMOUNT",
            };
        }

        if (!loanProduct.duration.includes(loanData.loan_duration)) {
            return {
                success: false,
                message: `Invalid loan duration. Allowed durations for ${loanProduct.name} are: ${loanProduct.duration.join(", ")} months.`,
                code: "INVALID_DURATION",
            };
        }

        //gen repayment plan
        const interestRate = loanProduct.interest;
        const repaymentPlan = calculateRepaymentPlan(
            loanData.loan_amount,
            loanData.loan_duration,
            interestRate,
            loanProduct.interest_type,
            loanData.processingFee
        );
        

        let repayments = [];
        if (loanProduct.interest_type === "flat_rate") {
            const monthlyPayment = parseFloat(repaymentPlan.monthlyPayment);
            const monthlyPrincipal = parseFloat(repaymentPlan.totalCapital) / loanData.loan_duration;
            const monthlyInterest = parseFloat(repaymentPlan.totalInterest) / loanData.loan_duration;

            //create repayment schedule for flat-rate
            for (let i = 0; i < loanData.loan_duration; i++) {
                repayments.push({
                    repayment_id: null,
                    principal: monthlyPrincipal.toFixed(2),
                    interest: monthlyInterest.toFixed(2),
                    amount: monthlyPayment.toFixed(2),
                    due_date: null,
                });
            }
        } else if (loanProduct.interest_type === "reducing_balance") {
            //make use for repayment schedule from the helper
            repayments = repaymentPlan.repaymentSchedule.map((schedule) => ({
                repayment_id: null,
                principal: parseFloat(schedule.principal).toFixed(2),
                interest: parseFloat(schedule.interest).toFixed(2),
                amount: parseFloat(schedule.payment).toFixed(2),
                remaining_principal: parseFloat(schedule.remainingPrincipal).toFixed(2),
                due_date: null,
            }));
        }

        return {
            success: true,
            repaymentPlan,
            repayments,
        };
    } catch (error) {
        console.error("Error calculating loan preview:", error);
        return {
            success: false,
            message: "Error Calculating Loan Data",
        };
    }
  }


  static async deleteLoanApplication(loanAppId) {
        try {
            const loanApplication = await LoanApplication.findById(loanAppId);

            if (!loanApplication) {
                return { success: false, message: "Loan application not found" };
            }

            await loanApplication.deleteOne();

            return {
                success: true,
                message: "Loan application deleted successfully",
            };
        } catch (error) {
            console.error("Error deleting loan application:", error);
            return { success: false, message: "Error deleting loan application" };
        }
  }

  static async getLoanApplicationByIdOrLoanId(identifier) {
    try {
        const query = mongoose.Types.ObjectId.isValid(identifier)
            ? { _id: identifier }
            : { loan_id: identifier };

        const loanApplication = await LoanApplication.findOne(query)
            .populate("customer")
            .populate("loan_product")
            .populate("repayments");

        if (!loanApplication) {
            return {
                success: false,
                message: "Loan application not found",
                code: "NOT_FOUND",
            };
        }
        return {
            success: true,
            loanApplication,
        };
    } catch (error) {
        console.error("Error fetching loan application:", error);
        return {
            success: false,
            message: "An unexpected error occurred while fetching the loan application.",
            code: "SERVER_ERROR",
        };
    }
  }
};
