const LoanApplication = require("../models/loanApplication");
const User = require("../models/user");
const LoanProduct = require("../models/loanProduct");
const { calculateRepaymentPlan } = require("../helpers/calcRepayment.helper");
const Repayment = require("../models/repayment");
const { sendGuarantorMail } = require("../config/mailer");
const { default: mongoose } = require("mongoose");
const GuarantorsDataService = require("./guarantorsDataService");
const ActivityLogService = require("../services/activityLogService");
const ApprovalService = require("./loanApprovalService");
const staff = require("../models/staff");
const mailer = require("../config/mailer");



module.exports = class LoanApplicationService {
  // static async createLoanApplication(loanData, files) {
  //   try {
  //     const loanProduct = await LoanProduct.findById(loanData.loan_product);
  //     if (!loanProduct) {
  //       return {
  //         success: false,
  //         message: "Loan product not found",
  //         code: "NOT_FOUND",
  //       };
  //     }

  //     const compare =
  //       loanData.loan_amount < loanProduct.min ||
  //       loanData.loan_amount > loanProduct.max;
  //     if (compare) {
  //       return {
  //         success: false,
  //         message: `Loan amount for ${loanProduct.name} must be between ${loanProduct.min} and ${loanProduct.max}`,
  //         code: "INVALID_AMOUNT",
  //       };
  //     }

  //     const isValidDuration = loanProduct.duration.includes(loanData.loan_duration);
  //     if (!isValidDuration) {
  //       return {
  //         success: false,
  //         message: `Invalid loan duration. Allowed durations for ${loanProduct.name} are: ${loanProduct.duration.join(", ")} months.`,
  //         code: "INVALID_DURATION",
  //       };
  //     }

  //     const lastLoan = await LoanApplication.findOne({}, { loan_id: 1 })
  //       .sort({ createdAt: -1 })
  //       .limit(1);

  //     let newLoanId = "CWLN-1024";
  //     if (lastLoan && lastLoan.loan_id) {
  //       const lastLoanNumber = parseInt(lastLoan.loan_id.split("-")[1], 10);
  //       newLoanId = `CWLN-${lastLoanNumber + 1}`;
  //     }

  //     // Calculate repayment plan
  //     const repaymentPlan = calculateRepaymentPlan(
  //       loanData.loan_amount,
  //       loanData.loan_duration,
  //       loanProduct.interest,
  //       loanProduct.interest_type,
  //       loanData.processing_fee
  //     );

  //     // Process uploaded files
  //     const statementOfAccount =
  //       files["statement_of_account"]?.[0]?.path || null;
  //     const statementOfNetWorth =
  //       files["statement_of_networth"]?.[0]?.path || null;
  //     const securityCheque = files["security_cheque"]?.[0]?.path || null;

  //     const loanApplication = new LoanApplication({
  //       ...loanData,
  //       loan_id: newLoanId,
  //       interest_rate: loanProduct.interest,
  //       statement_of_account: statementOfAccount,
  //       statement_of_networth: statementOfNetWorth,
  //       security_cheque: securityCheque,
  //       date_disbursed: loanData.date_disbursed || null,
  //       repayment_plan: repaymentPlan,
  //     });

  //     const x = await loanApplication.save();
  //     const _loanApplication = await LoanApplication.findById(x._id).populate("customer", "name").populate("loan_product", "name");

  //     // Send emails to guarantors
  //     await Promise.all([
  //       sendGuarantorMail(
  //         _loanApplication.guarantor1.email,
  //         _loanApplication.guarantor1.name,
  //         _loanApplication.customer.name,
  //         {
  //           loanProduct: _loanApplication.loan_product.name,
  //           loanAmount: _loanApplication.loan_amount,
  //           loanDuration: _loanApplication.loan_duration,
  //         }
  //       ),

  //       sendGuarantorMail(
  //         _loanApplication.guarantor2.email,
  //         _loanApplication.guarantor2.name,
  //         _loanApplication.customer.name,
  //         {
  //           loanProduct: _loanApplication.loan_product.name,
  //           loanAmount: _loanApplication.loan_amount,
  //           loanDuration: _loanApplication.loan_duration,
  //         }
  //       ),
  //     ]);
  //     await ActivityLogService.LogActivity(
  //       "create",
  //       loanData.createdByType,
  //       loanData.createdBy,
  //       "LoanApplication",
  //       _loanApplication._id,
  //       {
  //         loanProduct: _loanApplication.loan_product,
  //         loanAmount: _loanApplication.loan_amount,
  //         loanDuration: _loanApplication.loan_duration,
  //         loanStatus: _loanApplication.status,
  //       }
  //     )
  //     return {
  //       success: true,
  //       loanApplication,
  //       repaymentPlan,
  //     };
  //   } catch (error) {
  //     console.error('Error creating loan application', error);
  //     return {
  //       success: false,
  //       message: `Error: ${error.message}`,
  //       code: "INTERNAL_ERROR",
  //     };
  //   }
  // }

  static async uploadAdditionalDocument(loanApplicationId, documentData) {
    try {
        const loanApplication = await LoanApplication.findById(loanApplicationId);

        if (!loanApplication) {
            return {
                success: false,
                message: "Loan application not found",
                code: 404,
            };
        }

        loanApplication.optional_documents.push({
            document_name: documentData.document_name,
            document_url: documentData.document_url,
            notes: documentData.notes || "",
            uploadedByType: documentData.uploadedByType,
            uploaded_by: documentData.uploaded_by,
        });

        const updatedLoanApplication = await loanApplication.save();

        return {
            success: true,
            message: "Document uploaded successfully",
            data: updatedLoanApplication,
        };
    } catch (error) {
        console.error("Error uploading additional document:", error);
        return {
            success: false,
            message: `Error: ${error.message}`,
            code: 500,
        };
    }
  }

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

      // Validate loan amount
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

      // Validate loan duration
      const isValidDuration = loanProduct.duration.includes(loanData.loan_duration);
      if (!isValidDuration) {
        return {
          success: false,
          message: `Invalid loan duration. Allowed durations for ${loanProduct.name} are: ${loanProduct.duration.join(", ")} months.`,
          code: "INVALID_DURATION",
        };
      }

      // Generate loan ID
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

      let statementOfAccount = null;
      let statementOfNetWorth = null;
      let securityCheque = null;
      let businessFinancial = null;
      let businessCollateral = null;
      let otherDocuments = null;

      // Process uploaded files based on loan type
      if (loanData.loan_type === "individual") {
        statementOfAccount = files["statement_of_account"]?.[0]?.path || null;
        statementOfNetWorth = files["statement_of_networth"]?.[0]?.path || null;
        securityCheque = files["security_cheque"]?.[0]?.path || null;
      } else if (loanData.loan_type === "business") {
        statementOfAccount = files["statement_of_account"]?.[0]?.path || null;
        statementOfNetWorth = files["statement_of_networth"]?.[0]?.path || null;
        securityCheque = files["security_cheque"]?.[0]?.path || null;
        businessFinancial = {
          annual_revenue: loanData.business_financial?.annual_revenue || null,
        };
        businessCollateral = {
          description_of_assets: files["business_collateral.description_of_assets"]?.[0]?.path || null,
          valuation_reports: files["business_collateral.valuation_reports"]?.[0]?.path || null,
          photographs: files["business_collateral.photographs"]?.[0]?.path || null,
        };
        otherDocuments = {
          business_plan: files["other_documents.business_plan"]?.[0]?.path || null,
          insurance_documents: files["other_documents.insurance_documents"]?.[0]?.path || null,
          tax_clearance: files["other_documents.tax_clearance"]?.[0]?.path || null,
        };
      }

      const loanApplication = new LoanApplication({
        ...loanData,
        loan_id: newLoanId,
        interest_rate: loanProduct.interest,
        statement_of_account: statementOfAccount,
        statement_of_networth: statementOfNetWorth,
        security_cheque: securityCheque,
        business_financials: businessFinancial,
        collateral: businessCollateral,
        other_documents: otherDocuments,
        date_disbursed: loanData.date_disbursed || null,
        repayment_plan: repaymentPlan,
      });

      const savedLoanApplication = await loanApplication.save();
      const _loanApplication = await LoanApplication.findById(savedLoanApplication._id)
        .populate("customer", "first_name")
        .populate("loan_product", "name");
      await Promise.all([
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

      const apploanProduct = await LoanProduct.findById(_loanApplication.loan_product);
      let createdBy;
      if(loanData.createdByType == "Staff"){
        createdBy = await staff.findById(loanData.createdBy)
      }else{
        createdBy = await User.findById(loanData.createdBy)
      }
      const name = `${createdBy.first_name} ${createdBy.last_name}`;
      // Log the activity
      await ActivityLogService.LogActivity(
        "create",
        loanData.createdByType,
        loanData.createdBy,
        "LoanApplication",
        _loanApplication._id,
        {
          loanProductDetails: apploanProduct,
          loanAmount: _loanApplication.loan_amount,
          loanDuration: _loanApplication.loan_duration,
          loanStatus: _loanApplication.status,
          message: `This Loan Application was created by ${loanData.createdByType}, ${name}`,
        }
      );

      const approvals = await ApprovalService.createApprovals(_loanApplication._id)
      

      return {
        success: true,
        loanApplication: _loanApplication,
        repaymentPlan,
        approvals
      };
    } catch (error) {
      console.error("Error creating loan application", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async getAllLoanApplication(filters, pagination) {
    const { status, search , createdBy} = filters;
    const { page = 1, limit = 10 } = pagination;

    try {
      const queryFilter = {};

      if (status) {
        queryFilter.status = status;
      }

      if (createdBy) {
        queryFilter.createdBy = createdBy;
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
        .populate("loan_product")
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
        first: `/loan-apps?page=1&limit=${limit}${status ? `&status=${status}` : ""
          }${search ? `&search=${search}` : ""}`,
        prev:
          page > 1
            ? `/loan-apps?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ""
            }${search ? `&search=${search}` : ""}`
            : null,
        next:
          page < totalPages
            ? `/loan-apps?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ""
            }${search ? `&search=${search}` : ""}`
            : null,
        last: `/loan-apps?page=${totalPages}&limit=${limit}${status ? `&status=${status}` : ""
          }${search ? `&search=${search}` : ""}`,
      };
      // await LoanApplication.deleteMany();
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
        first: `/loans/${userId}?page=1&limit=${limit}${status ? `&status=${status}` : ""
          }`,
        prev:
          page > 1
            ? `/loans/${userId}?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ""
            }`
            : null,
        next:
          page < totalPages
            ? `/loans/${userId}?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ""
            }`
            : null,
        last: `/loans/${userId}?page=${totalPages}&limit=${limit}${status ? `&status=${status}` : ""
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


  static async deleteLoanApplication(loanAppId, performedBy) {
    try {
      const loanApplication = await LoanApplication.findById(loanAppId);

      if (!loanApplication) {
        return { success: false, message: "Loan application not found" };
      }

      loanApplication.status = "deleted";
      await loanApplication.save();

      await ActivityLogService.LogActivity(
        "delete",
        "Staff",
        performedBy,
        "LoanApplication",
        loanAppId,
        {
          loanId: loanApplication.loan_id,
          status: "deleted",
          previousStatus: loanApplication.status,
        }
      );

      return {
        success: true,
        message: "Loan application marked as deleted successfully",
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
        .populate({
            path: "customer",
            populate: {
                path: "kyc_verification"
            }
        })
        .populate("loan_product")
        .populate("repayments");

      if (!loanApplication) {
        return {
          success: false,
          message: "Loan application not found",
          code: "NOT_FOUND",
        };
      }

      const [guarantor1, guarantor2] = await Promise.all([
        GuarantorsDataService.getGuarantorByLoanIdAndEmail(
          loanApplication._id,
          loanApplication.guarantor1?.email
        ),
        GuarantorsDataService.getGuarantorByLoanIdAndEmail(
          loanApplication._id,
          loanApplication.guarantor2?.email
        ),
      ]);
      const applicationActivity = await ActivityLogService.getActivityLogs("LoanApplication", loanApplication._id)
      const approvals = await ApprovalService.fetchApprovalsForLoanApplication(loanApplication._id)
      return {
        success: true,
        loanApplication,
        approvals,
        guarantor1: guarantor1 || null,
        guarantor2: guarantor2 || null,
        appActivity: applicationActivity.success ? applicationActivity.data : [],
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


  static async getUserLoansWithActivity(userId, filters, pagination) {
    const { status } = filters;
    const { page = 1, limit = 10 } = pagination;

    try {
        const query = { customer: userId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        // Fetch loan applications with the necessary data
        const loanApplications = await LoanApplication.find(query)
            .populate("loan_product", "name interest desc")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalApplications = await LoanApplication.countDocuments(query);
        const totalPages = Math.ceil(totalApplications / limit);

        // Fetch activities for each loan
        const loansWithActivity = await Promise.all(
            loanApplications.map(async (loan) => {
                const activityLogs = await ActivityLogService.getActivityLogs("LoanApplication", loan._id);
                return {
                    ...loan.toObject(),
                    activityLogs: activityLogs.success ? activityLogs.data : [],
                };
            })
        );

        const paginationLinks = {
            first: `/loans/${userId}?page=1&limit=${limit}${status ? `&status=${status}` : ""}`,
            prev:
                page > 1
                    ? `/loans/${userId}?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ""}`
                    : null,
            next:
                page < totalPages
                    ? `/loans/${userId}?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ""}`
                    : null,
            last: `/loans/${userId}?page=${totalPages}&limit=${limit}${status ? `&status=${status}` : ""}`,
        };

        return {
            success: true,
            data: {
                loans: loansWithActivity,
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
        console.error("Error fetching user's loans with activity:", error);
        return {
            success: false,
            message: "Could not fetch loans with activity",
        };
    }
  }

  static async userLoanSummary(userId) {
    try {
        const loanApplications = await LoanApplication.find({ customer: userId }).populate("repayments");

        let totalLoanApplications = 0;
        let totalLoanApplicationAmount = 0;
        let totalApprovedLoans = 0;
        let totalApprovedLoanAmount = 0;
        let totalDisbursedLoans = 0;
        let totalDisbursedLoanAmount = 0;
        let totalDeclinedLoans = 0;
        let totalDeclinedLoanAmount = 0;
        let totalCompletedRepayments = 0;
        let totalCompletedRepaymentAmount = 0;
        let totalDebts = 0;
        let totalDebtsAmount = 0;
        let totalInterest = 0;

        loanApplications.forEach((loan) => {
            totalLoanApplications++;
            totalLoanApplicationAmount += loan.loan_amount || 0;

            if (loan.status === "approved") {
                totalApprovedLoans++;
                totalApprovedLoanAmount += loan.loan_amount || 0;
            }

            if (loan.status === "disbursed") {
                totalDisbursedLoans++;
                totalDisbursedLoanAmount += loan.loan_amount || 0;
            }

            if (loan.status === "declined") {
                totalDeclinedLoans++;
                totalDeclinedLoanAmount += loan.loan_amount || 0;
            }

            loan.repayments.forEach((repayment) => {
                if (repayment.status === "paid") {
                    totalCompletedRepayments++;
                    totalCompletedRepaymentAmount += repayment.amount || 0;
                    totalInterest += repayment.interest || 0;
                } else if (repayment.status === "unpaid") {
                    totalDebts++;
                    totalDebtsAmount += repayment.amount || 0;
                }
            });
        });

        return {
            success: true,
            data: {
                totalLoanApplications,
                totalLoanApplicationAmount,
                totalApprovedLoans,
                totalApprovedLoanAmount,
                totalDisbursedLoans,
                totalDisbursedLoanAmount,
                totalDeclinedLoans,
                totalDeclinedLoanAmount,
                totalCompletedRepayments,
                totalCompletedRepaymentAmount,
                totalDebts,
                totalDebtsAmount,
                totalInterest,
            },
        };
    } catch (error) {
        console.error("Error fetching loan summary:", error);
        return { success: false, message: "Could not fetch loan summary" };
    }
  }


  static async fetchAllRepaymentsForUser(userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;

        const loanApplications = await LoanApplication.find({ customer: userId }).select('repayments');
        const repaymentIds = loanApplications.flatMap(app => app.repayments);

        // Fetch repayments
        const totalRepayments = await Repayment.countDocuments({ _id: { $in: repaymentIds } });
        const repayments = await Repayment.find({ _id: { $in: repaymentIds } })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalRepayments / limit);

        const paginationLinks = {
          first: `/user-repayments/${userId}?page=1&limit=${limit}`,
          prev: page > 1 ? `/user-repayments/${userId}?page=${page - 1}&limit=${limit}` : null,
          next: page < totalPages ? `/user-repayments/${userId}?page=${page + 1}&limit=${limit}` : null,
          last: `/user-repayments/${userId}?page=${totalPages}&limit=${limit}`,
        };

        const data = {
            repayments,
            links: {
                ...paginationLinks,
                currentPage: page,
                totalPages,
                totalPerPage: limit,
                total: totalRepayments,
            },
        };

        return { success: true, message: "Repayments fetched successfully", data };
    } catch (error) {
        console.error("Error fetching repayments for user:", error);
        return { success: false, message: "Failed to fetch repayments" };
    }
  }


static async fetchRepaymentsForLoanApplication(loanApplicationId) {
    try {
        const loanApplication = await LoanApplication.findById(loanApplicationId).populate('repayments');

        if (!loanApplication) {
            return { success: false, message: "Loan application not found" };
        }

        return { success: true, message: "Repayments fetched successfully", data: loanApplication.repayments };
    } catch (error) {
        console.error("Error fetching repayments for loan application:", error);
        return { success: false, message: "Failed to fetch repayments" };
    }
  }


static async fetchAllRepayments(page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;

        const totalRepayments = await Repayment.countDocuments();
        const repayments = await Repayment.find()
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalRepayments / limit);

        const paginationLinks = {
          first: `/repayments?page=1&limit=${limit}`,
          prev: page > 1 ? `/repayments?page=${page - 1}&limit=${limit}` : null,
          next: page < totalPages ? `/repayments?page=${page + 1}&limit=${limit}` : null,
          last: `/repayments?page=${totalPages}&limit=${limit}`,
      };
      

        const data = {
            repayments,
            links: {
                ...paginationLinks,
                currentPage: page,
                totalPages,
                totalPerPage: limit,
                total: totalRepayments,
            },
        };

        return { success: true, message: "All repayments fetched successfully", data };
    } catch (error) {
        console.error("Error fetching all repayments:", error);
        return { success: false, message: "Failed to fetch repayments" };
    }
  }


  static async disburseLoan(loanApplicationId) {
    try {
        const loanApplication = await LoanApplication.findById(loanApplicationId)
            .populate("loan_product", "interest interest_type")
            .populate("customer", "first_name email business_name");
            console.log("zeroth ", loanApplication); 
        if (!loanApplication) {
            return {
                success: false,
                message: "Loan application not found",
                code: "NOT_FOUND",
            };
        }
        const customer = await User.findById(loanApplication.customer);

        if (loanApplication.status !== "ready_for_disbursement") {
            return {
                success: false,
                message: "Loan application is not ready for disbursement",
                code: "INVALID_STATUS",
            };
        }

        //calculate repayment plan
        const repaymentPlan = calculateRepaymentPlan(
            loanApplication.loan_amount,
            loanApplication.loan_duration,
            loanApplication.interest_rate,
            loanApplication.loan_product.interest_type,
            loanApplication.processing_fee
        );

        //gen repayments array
        const repayments = [];
        let remainingPrincipal = loanApplication.loan_amount;

        //get the last repayment ID from the database to ensure sequential IDs
        const lastRepayment = await Repayment.findOne({}, { repayment_id: 1 })
            .sort({ createdAt: -1 })
            .limit(1);

        let nextRepaymentId = 1; //default start value
        if (lastRepayment && lastRepayment.repayment_id) {
            const lastNumber = parseInt(lastRepayment.repayment_id.split("-")[1], 10);
            nextRepaymentId = lastNumber + 1;
        }

        if (loanApplication.loan_product.interest_type === "flat_rate") {
            //for flat rate, populate repayments with calculated values
            const monthlyPayment = repaymentPlan.monthlyPayment;
            const totalInterest = repaymentPlan.totalInterest;

            for (let i = 0; i < loanApplication.loan_duration; i++) {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i + 1); //add months for each repayment

                const repayment = new Repayment({
                    repayment_id: `CWRP-${nextRepaymentId.toString().padStart(6, "0")}`,
                    principal: (loanApplication.loan_amount / loanApplication.loan_duration),
                    remaining_principal: remainingPrincipal - (loanApplication.loan_amount / loanApplication.loan_duration),
                    interest: totalInterest / loanApplication.loan_duration,
                    amount: monthlyPayment,
                    due_date: dueDate,
                    status: "unpaid",
                });

                repayments.push(repayment);
                remainingPrincipal -= (loanApplication.loan_amount / loanApplication.loan_duration);
                nextRepaymentId++; //ncrement for the next repayment
            }
        } else if (loanApplication.loan_product.interest_type === "reducing_balance") {
            //for reducing balance, simulate detailed repayment schedule
            const monthlyPrincipal = loanApplication.loan_amount / loanApplication.loan_duration;

            for (let i = 0; i < loanApplication.loan_duration; i++) {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i + 1); //add months for each repayment

                const interest = (remainingPrincipal * (loanApplication.interest_rate / 100)) / 12;
                const principal = monthlyPrincipal;
                const amount = principal + interest;

                const repayment = new Repayment({
                    repayment_id: `CWRP-${nextRepaymentId.toString().padStart(6, "0")}`,
                    principal: principal,
                    remaining_principal: remainingPrincipal - principal,
                    interest: interest,
                    amount: amount,
                    due_date: dueDate,
                    status: "unpaid",
                });

                repayments.push(repayment);
                remainingPrincipal -= principal;
                nextRepaymentId++; //increment repayment id
            }
        }

        const savedRepayments = await Repayment.insertMany(repayments);

        loanApplication.status = "disbursed";
        loanApplication.date_disbursed = new Date();
        loanApplication.repayments = savedRepayments.map((repayment) => repayment._id);

        await loanApplication.save();

        // send email notification
        await mailer.sendDisbursementEmail(
            customer.email,
            loanApplication.customer.first_name || loanApplication.customer.business_name,
            loanApplication.loan_amount,
            loanApplication.loan_duration,
            loanApplication.loan_product.name,
            loanApplicationId
        );

        return {
            success: true,
            message: "Loan disbursed successfully",
            loanApplication,
        };
    } catch (error) {
        console.error("Error disbursing loan:", error);
        return {
            success: false,
            message: `Error: ${error.message}`,
            code: "INTERNAL_ERROR",
        };
    }
  }
};
