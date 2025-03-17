const LoanProjectionService = require('./../services/loanProjectionService');

class LoanProjectionController {
    // Create a new loan projection
    static async createLoanProjection(req, res) {
        try {
            const data = req.body;
            const createdLoanProjection = await LoanProjectionService.createLoanProjection(data);
            res.status(201).json({
                message: 'Loan projection created successfully!',
                data: createdLoanProjection
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Get all loan projections
    static async getAllLoanProjections(req, res) {
        try {
            const projections = await LoanProjectionService.getAllLoanProjections();
            res.status(200).json({
                message: 'Loan projections retrieved successfully!',
                data: projections
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get loan projection for a specific loan package and year
    static async getLoanProjectionByYearAndPackage(req, res) {
        const { year, loan_package } = req.params;
        try {
            const projection = await LoanProjectionService.getLoanProjectionByYearAndPackage(year, loan_package);
            if (!projection) {
                return res.status(404).json({ message: 'Loan projection not found!' });
            }
            res.status(200).json({
                message: 'Loan projection retrieved successfully!',
                data: projection
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update loan projection for a specific month
    static async updateLoanProjection(req, res) {
        const { year, loan_package } = req.params;
        try {
            const updatedProjection = await LoanProjectionService.updateLoanProjection(year, loan_package, req.body);
            res.status(200).json({
                message: 'Loan projection updated successfully!',
                data: updatedProjection
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete a loan projection
    static async deleteLoanProjection(req, res) {
        const { year, loan_package } = req.params;
        try {
            const deletedProjection = await LoanProjectionService.deleteLoanProjection(year, loan_package);
            if (!deletedProjection) {
                return res.status(404).json({ message: 'Loan projection not found!' });
            }
            res.status(200).json({
                message: 'Loan projection deleted successfully!',
                data: deletedProjection
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = LoanProjectionController;
