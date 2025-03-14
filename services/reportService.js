const LoanApplication = require("../models/loanApplication");
const LoanApproval = require("../models/loanApproval");
const staff = require("../models/staff");
const AdminService = require("./adminService");
const getLoanReport = async (startDate, endDate) => {
    const filter = {};

    if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Get total loan count and amounts
    const totalLoans = await LoanApplication.countDocuments(filter);
    const totalLoanAmount = await LoanApplication.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: "$loan_amount" } } }
    ]);

    // Get loan counts and amounts grouped by status
    const statusData = await LoanApplication.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$loan_amount" }
            }
        }
    ]);

    // Set default values for all statuses
    const defaultStatuses = [
        "new", "processing", "approved", "disbursed", "overdue", "fully_paid",
        "closed", "ready_for_disbursement", "deleted", "declined"
    ];

    const statusSummary = {};
    defaultStatuses.forEach(status => {
        statusSummary[status] = {
            count: 0,
            percentage: 0,
            totalAmount: 0
        };
    });

    // Update with actual data
    statusData.forEach(({ _id, count, totalAmount }) => {
        statusSummary[_id] = {
            count,
            percentage: totalLoans > 0 ? ((count / totalLoans) * 100).toFixed(2) : 0,
            totalAmount
        };
    });

    // Get loan type breakdown
    const loanTypeData = await LoanApplication.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$loan_type",
                count: { $sum: 1 },
                totalAmount: { $sum: "$loan_amount" }
            }
        }
    ]);

    const loanTypeBreakdown = {
        individual: { count: 0, percentage: 0, totalAmount: 0 },
        business: { count: 0, percentage: 0, totalAmount: 0 }
    };

    loanTypeData.forEach(({ _id, count, totalAmount }) => {
        loanTypeBreakdown[_id] = {
            count,
            percentage: totalLoans > 0 ? ((count / totalLoans) * 100).toFixed(2) : 0,
            totalAmount
        };
    });

    // Calculate other totals
    const totalInterestEarned = await LoanApplication.aggregate([
        { $match: { ...filter, status: "fully_paid" } },
        { $group: { _id: null, totalInterest: { $sum: "$repayment_plan.totalInterest" } } }
    ]);

    const totalProcessingFees = await LoanApplication.aggregate([
        { $match: filter },
        { $group: { _id: null, totalFees: { $sum: "$processing_fee" } } }
    ]);

    return {
        totalLoans,
        totalLoanAmount: totalLoanAmount[0]?.totalAmount || 0,
        totalInterestEarned: totalInterestEarned[0]?.totalInterest || 0,
        totalProcessingFees: totalProcessingFees[0]?.totalFees || 0,
        statusSummary,
        loanTypeBreakdown
    };
};

const getLoanMetricsByProduct = async (startDate, endDate) => {
    const filter = {};
    
    if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const metrics = await LoanApplication.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$loan_product",
                totalLoans: { $sum: 1 },
                totalLoanAmount: { $sum: "$loan_amount" },
                totalApprovedLoans: {
                    $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
                },
                totalDisbursedLoans: {
                    $sum: { $cond: [{ $eq: ["$status", "disbursed"] }, 1, 0] }
                },
                totalOverdueLoans: {
                    $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] }
                },
                totalFullyPaidLoans: {
                    $sum: { $cond: [{ $eq: ["$status", "fully_paid"] }, 1, 0] }
                },
                totalInterestEarned: { $sum: "$repayment_plan.totalInterest" },
                totalProcessingFees: { $sum: "$processing_fee" }
            }
        },
        {
            $lookup: {
                from: "loanproducts",
                localField: "_id",
                foreignField: "_id",
                as: "loan_product_details"
            }
        },
        {
            $unwind: "$loan_product_details"
        },
        {
            $project: {
                _id: 0,
                loanProductId: "$_id",
                loanProductName: "$loan_product_details.name",
                totalLoans: 1,
                totalLoanAmount: 1,
                totalApprovedLoans: 1,
                totalDisbursedLoans: 1,
                totalOverdueLoans: 1,
                totalFullyPaidLoans: 1,
                totalInterestEarned: 1,
                totalProcessingFees: 1
            }
        }
    ]);

    return metrics;
};

const getRelationshipOfficerReport = async (relationshipOfficerId, startDate, endDate) => {
    try {
        const filter = { approvalAction: "Relationship Manager" };

        if (relationshipOfficerId) {
            filter.assignee = relationshipOfficerId;
        }

        if (startDate && endDate) {
            filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Fetch Loan Approvals & Populate Loan Applications
        const approvals = await LoanApproval.find(filter).populate({
            path: "loanApplication",
            select: "loan_amount status loan_type repayment_plan.totalInterest processing_fee",
        });

        if (!approvals.length) return { message: "No loan approvals found" };

        const officerReports = {};

        for (const approval of approvals) {  // ✅ Use for...of instead of forEach
            const loan = approval.loanApplication;
            if (!loan) continue;

            const officerId = approval.assignee?.toString();
            if (!officerId) continue;

            if (!officerReports[officerId]) {
                const _offerDetails = await AdminService.getStaffById(officerId);  // ✅ await inside for...of loop
                officerReports[officerId] = {
                    relationshipOfficerId: _offerDetails,
                    totalLoans: 0,
                    totalLoanAmount: 0,
                    totalInterestEarned: 0,
                    totalProcessingFees: 0,
                    statusSummary: {
                        new: { count: 0, percentage: 0, totalAmount: 0 },
                        processing: { count: 0, percentage: 0, totalAmount: 0 },
                        approved: { count: 0, percentage: 0, totalAmount: 0 },
                        disbursed: { count: 0, percentage: 0, totalAmount: 0 },
                        overdue: { count: 0, percentage: 0, totalAmount: 0 },
                        fully_paid: { count: 0, percentage: 0, totalAmount: 0 },
                        closed: { count: 0, percentage: 0, totalAmount: 0 },
                        ready_for_disbursement: { count: 0, percentage: 0, totalAmount: 0 },
                        deleted: { count: 0, percentage: 0, totalAmount: 0 },
                        declined: { count: 0, percentage: 0, totalAmount: 0 },
                    },
                    loanTypeBreakdown: {
                        individual: { count: 0, percentage: 0, totalAmount: 0 },
                        business: { count: 0, percentage: 0, totalAmount: 0 },
                    },
                };
            }

            const officerData = officerReports[officerId];

            officerData.totalLoans += 1;
            officerData.totalLoanAmount += loan.loan_amount || 0;
            officerData.totalInterestEarned += loan.repayment_plan?.totalInterest || 0;
            officerData.totalProcessingFees += loan.processing_fee || 0;

            if (officerData.statusSummary[loan.status]) {
                officerData.statusSummary[loan.status].count += 1;
                officerData.statusSummary[loan.status].totalAmount += loan.loan_amount || 0;
            }

            if (officerData.loanTypeBreakdown[loan.loan_type]) {
                officerData.loanTypeBreakdown[loan.loan_type].count += 1;
                officerData.loanTypeBreakdown[loan.loan_type].totalAmount += loan.loan_amount || 0;
            }
        }

        Object.values(officerReports).forEach((report) => {
            Object.keys(report.statusSummary).forEach((key) => {
                report.statusSummary[key].percentage = report.totalLoans > 0
                    ? ((report.statusSummary[key].count / report.totalLoans) * 100).toFixed(2)
                    : 0;
            });

            Object.keys(report.loanTypeBreakdown).forEach((key) => {
                report.loanTypeBreakdown[key].percentage = report.totalLoans > 0
                    ? ((report.loanTypeBreakdown[key].count / report.totalLoans) * 100).toFixed(2)
                    : 0;
            });
        });

        return relationshipOfficerId
            ? officerReports[relationshipOfficerId] || { message: "No data found for this officer" }
            : Object.values(officerReports);
    } catch (error) {
        console.error("Error in getRelationshipOfficerReport:", error);
        return { error: "Error generating report" };
    }
};



module.exports = {
    getLoanReport,
    getLoanMetricsByProduct,
    getRelationshipOfficerReport
};
