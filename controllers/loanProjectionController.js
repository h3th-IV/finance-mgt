const LoanProjectionService = require('./../services/loanProjectionService');

class LoanProjectionController {
    // Create a new loan projection
    static async createLoanProjection(req, res) {
        const { year } = req.body;  // Get year from the request body
        try {
            // Check if a loan projection for this year already exists
            const existingProjection = await LoanProjectionService.getLoanProjectionByYear(year);
            if (existingProjection) {
                return res.status(400).json({
                    message: 'Loan projection for this year already exists!'
                });
            }

            const data = req.body;
            const createdLoanProjection = await LoanProjectionService.createLoanProjection(data);
            res.status(201).json({
                message: 'Loan projection created successfully!',
                data: createdLoanProjection
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
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

    // Get a loan projection by year
    static async getLoanProjectionByYear(req, res) {
        const { year } = req.params;
        try {
            const projection = await LoanProjectionService.getLoanProjectionByYear(year);
            if (!projection) {
                return res.status(404).json({ message: 'Loan projection for the year not found!' });
            }
            res.status(200).json({
                message: 'Loan projection retrieved successfully!',
                data: projection
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update loan projection by year
    static async updateLoanProjectionByYear(req, res) {
        const { year } = req.params;
        const newData = req.body;
        try {
            const updatedProjection = await LoanProjectionService.updateLoanProjectionByYear(year, newData);
            if (!updatedProjection) {
                return res.status(404).json({ message: 'Loan projection for the year not found!' });
            }
            res.status(200).json({
                message: 'Loan projection updated successfully!',
                data: updatedProjection
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Delete loan projection by year
    static async deleteLoanProjectionByYear(req, res) {
        const { year } = req.params;
        try {
            const deletedProjection = await LoanProjectionService.deleteLoanProjectionByYear(year);
            if (!deletedProjection) {
                return res.status(404).json({ message: 'Loan projection for the year not found!' });
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
