const CreditReport = require("../models/creditReport");

module.exports = class CreditReportService {
    static async saveIndividualCreditReport(customerId, reportData) {
        try {
            const creditReport = new CreditReport({
                customer: customerId,
                report: reportData,
            });

            await creditReport.save();

            return {
                success: true,
                message: "Credit report saved successfully",
                creditReport,
            };
        } catch (error) {
            console.error("Error saving credit report:", error.message);
            return {
                success: false,
                message: "Error saving credit report",
                error,
            };
        }
    }

    static async getCreditReportsByCustomer(customerId) {
        try {
            const creditReports = await CreditReport.find({ customer: customerId }).exec();

            if (!creditReports.length) {
                return {
                    success: false,
                    message: "No credit reports found for this customer",
                };
            }
            return {
                success: true,
                message: "Credit reports fetched successfully",
                creditReports,
            };
        } catch (error) {
            console.error("Error fetching credit reports:", error.message);
            return {
                success: false,
                message: "Error fetching credit reports",
                error,
            };
        }
    }
};
