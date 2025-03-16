const LoanProjection = require('../models/loanProjection');

class LoanProjectionService {
    // Create a new loan projection
    static async createLoanProjection(data) {
        try {
            const newLoanProjection = new LoanProjection(data);
            return await newLoanProjection.save();
        } catch (error) {
            throw new Error('Error creating loan projection: ' + error.message);
        }
    }

    // Get all loan projections
    static async getAllLoanProjections() {
        try {
            return await LoanProjection.find();
        } catch (error) {
            throw new Error('Error retrieving loan projections: ' + error.message);
        }
    }

    // Get a loan projection by year
    static async getLoanProjectionByYear(year) {
        try {
            return await LoanProjection.findOne({ year });
        } catch (error) {
            throw new Error('Error retrieving loan projection for the year: ' + error.message);
        }
    }

    // Update an existing loan projection by year
    static async updateLoanProjectionByYear(year, newData) {
        try {
            return await LoanProjection.findOneAndUpdate({ year }, newData, { new: true });
        } catch (error) {
            throw new Error('Error updating loan projection: ' + error.message);
        }
    }

    // Delete a loan projection by year
    static async deleteLoanProjectionByYear(year) {
        try {
            return await LoanProjection.findOneAndDelete({ year });
        } catch (error) {
            throw new Error('Error deleting loan projection: ' + error.message);
        }
    }
}

module.exports = LoanProjectionService;
