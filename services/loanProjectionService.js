const LoanProjection = require('../models/loanProjection');

class LoanProjectionService {
    // Create a new loan projection for a loan package and year
    static async createLoanProjection(data) {
        try {
            const { year, loan_package, projections } = data;
            const existingProjection = await LoanProjection.findOne({ year, loan_package });
            if (existingProjection) {
                throw new Error('Loan projection for this loan package and year already exists!');
            }

            // Create and save the new projection
            const newLoanProjection = new LoanProjection({ year, loan_package, projections });
            return await newLoanProjection.save();
        } catch (error) {
            throw new Error(`Error creating loan projection: ${error.message}`);
        }
    }

    // Get all loan projections
    static async getAllLoanProjections() {
        try {
            return await LoanProjection.find().populate('loan_package');
        } catch (error) {
            throw new Error(`Error retrieving loan projections: ${error.message}`);
        }
    }

    // Get a loan projection by year and loan package
    static async getLoanProjectionByYearAndPackage(year, loan_package) {
        try {
            return await LoanProjection.findOne({ year, loan_package }).populate('loan_package');
        } catch (error) {
            throw new Error(`Error retrieving loan projection: ${error.message}`);
        }
    }

    // Update loan projection for a specific month
    static async updateLoanProjection(year, loan_package, newData) {
        try {
            const projection = await LoanProjection.findOne({ year, loan_package });

            if (!projection) {
                throw new Error('Loan projection not found!');
            }

            // Update specific months without overriding everything
            Object.keys(newData.projections).forEach(month => {
                if (projection.projections[month]) {
                    projection.projections[month] = newData.projections[month];
                }
            });

            return await projection.save();
        } catch (error) {
            throw new Error(`Error updating loan projection: ${error.message}`);
        }
    }

    // Delete a loan projection for a specific year and loan package
    static async deleteLoanProjection(year, loan_package) {
        try {
            return await LoanProjection.findOneAndDelete({ year, loan_package });
        } catch (error) {
            throw new Error(`Error deleting loan projection: ${error.message}`);
        }
    }
}

module.exports = LoanProjectionService;
