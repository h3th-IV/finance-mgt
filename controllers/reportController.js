const reportService = require("../services/reportService");
const { successResponse, errorResponse } = require("../utils/responses");

const generateLoanReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
   
        const report = await reportService.getLoanReport(startDate, endDate);
        
        return res.status(200).json({
            message: "Loan report generated successfully",
            data: report
        });
    } catch (error) {
        console.error("Error generating loan report:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const generateLoanMetricsByProduct = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
   
        const report = await reportService.getLoanMetricsByProduct(startDate, endDate);
        
        return res.status(200).json({
            message: "Loan metrics by product generated successfully",
            data: report
        });
    } catch (error) {
        console.error("Error generating loan metrics by product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getRelationshipOfficerReport = async (req, res) => {
    try {
        const { officerId, startDate, endDate } = req.query;

        const report = await reportService.getRelationshipOfficerReport(officerId, startDate, endDate);
        return successResponse(res, 200, "Report generated successfully", report);
    } catch (error) {
        console.error("Error fetching Relationship Officer report:", error);
        return errorResponse(res, 500, "Internal Server Error", error.message);
    }
};


module.exports = {
    generateLoanReport,
    generateLoanMetricsByProduct,
    getRelationshipOfficerReport
};
