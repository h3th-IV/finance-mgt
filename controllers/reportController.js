const Loan = require("../models/loanApplication");
const LoanProjection = require("../models/loanProjection");
const { successResponse, errorResponse } = require("../utils/responses");

const generateLoanReport = async (req, res) => {
    try {
        const { year } = req.query;

        if (!year) {
            return errorResponse(res, 400, "Year is required");
        }

        // Get actual loan data, grouped by loan product and month
        const actualLoans = await Loan.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $year: { $toDate: "$createdAt" } }, parseInt(year)], // Filter by year
                    },
                },
            },
            {
                $addFields: {
                    month: { $month: { $toDate: "$createdAt" } }, // Extract month from createdAt field
                },
            },
            {
                $group: {
                    _id: { loanProductId: "$loan_product", month: "$month" }, // Group by loan product and month
                    totalLoanAmount: { $sum: "$loan_amount" },
                    totalLoanCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    loanProductId: "$_id.loanProductId",
                    month: "$_id.month",
                    totalLoanAmount: 1,
                    totalLoanCount: 1,
                    _id: 0, // Remove _id field from the result
                },
            },
        ]);

        // Create a map for actual loan data by loan product
        const loanDataByProduct = {};

        // Initialize the loanDataByProduct structure
        actualLoans.forEach((loan) => {
            const { loanProductId, month, totalLoanAmount, totalLoanCount } = loan;

            if (!loanDataByProduct[loanProductId]) {
                loanDataByProduct[loanProductId] = Array(12).fill({ totalLoanAmount: 0, totalLoanCount: 0 });
            }

            // Store the loan data for the specific month (1-12)
            loanDataByProduct[loanProductId][month - 1] = {
                totalLoanAmount,
                totalLoanCount,
            };
        });

        // Get projected loan data for the given year
        const projections = await LoanProjection.find({ year: parseInt(year) }).populate("loan_package");

        // Prepare the response object
        const report = {};

        // Month name to number mapping
        const monthNameToNumber = {
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
            july: 7,
            august: 8,
            september: 9,
            october: 10,
            november: 11,
            december: 12,
        };

        projections.forEach((projection) => {
            const { loan_package, projections } = projection;
            const productName = loan_package?.name || "Unknown Product";
            const productId = loan_package?._id;

            if (!report[productName]) {
                report[productName] = {};
            }

            // Ensure that each product has actual data for all months (1-12)
            const actualLoanData = loanDataByProduct[productId] || Array(12).fill({ totalLoanAmount: 0, totalLoanCount: 0 });

            // Iterate over the projections and map month names to numbers
            Object.keys(projections).forEach((monthName) => {
                const month = monthNameToNumber[monthName.toLowerCase()] || 0; // Get numeric month (1-12)

                if (month > 0) {
                    const actualData = actualLoanData[month - 1]; // Get actual data for the current month
                    const projectedData = projections[monthName] || { loan_amount: 0, loan_count: 0 };

                    // Calculate variance for amount and count
                    const amountVariance = actualData.totalLoanAmount - (projectedData.loan_amount || 0);
                    const countVariance = actualData.totalLoanCount - (projectedData.loan_count || 0);

                    // Calculate percentage variance for amount and count
                    const percentageVarianceAmount = projectedData.loan_amount === 0
                        ? (actualData.totalLoanAmount === 0 ? 0 : Infinity)
                        : ((amountVariance / projectedData.loan_amount) * 100);

                    const percentageVarianceCount = projectedData.loan_count === 0
                        ? (actualData.totalLoanCount === 0 ? 0 : Infinity)
                        : ((countVariance / projectedData.loan_count) * 100);

                    report[productName][month] = {
                        actualLoanAmount: actualData.totalLoanAmount,
                        projectedLoanAmount: projectedData.loan_amount || 0,
                        actualLoanCount: actualData.totalLoanCount,
                        projectedLoanCount: projectedData.loan_count || 0,
                        variance: {
                            amount: amountVariance,
                            count: countVariance,
                        },
                        percentageVariance: {
                            amount: parseInt(((actualData.totalLoanAmount /projectedData.loan_amount ) * 100).toFixed(2)),
                            count: parseInt(((actualData.totalLoanCount /projectedData.loan_count) * 100).toFixed(2)) ,
                        },
                    };
                }
            });
        });

        return successResponse(res, 200, "Detailed loan report generated successfully", report);
    } catch (error) {
        console.error("Error generating detailed loan report:", error);
        return errorResponse(res, 500, "Internal server error", error.message);
    }
};

module.exports = {
    generateLoanReport,
};
