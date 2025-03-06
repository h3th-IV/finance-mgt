const GuarantorsData = require('../models/guarantorsData');
const mongoose = require('mongoose')

class GuarantorsDataService {
    static async createGuarantor(data, files) {
        try {
            const guarantorData = {
                ...data,
                file: files["file"]?.url || null
            };

            const guarantor = new GuarantorsData(guarantorData);
            const savedGuarantor = await guarantor.save();
            return { success: true, guarantor: savedGuarantor };
        } catch (error) {
            console.error("Error creating guarantor:", error);
            return { success: false, message: error.message };
        }
    }

    static async getGuarantorById(id) {
        try {
            const guarantor = await GuarantorsData.findById(id);
            if (!guarantor) {
                return { success: false, message: "Guarantor not found" };
            }
            return { success: true, guarantor };
        } catch (error) {
            console.error("Error retrieving guarantor:", error);
            return { success: false, message: error.message };
        }
    }

    static async getGuarantorByLoanIdAndEmail(id, email) {
        try {
            const guarantor = await GuarantorsData.findOne({loanApplicationId: id, email: email});
            if (!guarantor) {
                return { success: false, message: "Guarantor not found" };
            }
            return { success: true, guarantor };
        } catch (error) {
            console.error("Error retrieving guarantor:", error);
            return { success: false, message: error.message };
        }
    }

    static async updateGuarantor(id, data) {
        try {
            const updatedGuarantor = await GuarantorsData.findByIdAndUpdate(id, data, { new: true });
            if (!updatedGuarantor) {
                return { success: false, message: "Guarantor not found" };
            }
            return { success: true, guarantor: updatedGuarantor };
        } catch (error) {
            console.error("Error updating guarantor:", error);
            return { success: false, message: error.message };
        }
    }

    static async deleteGuarantor(id) {
        try {
            const updatedGuarantor = await GuarantorsData.findByIdAndUpdate(
                id,
                { isActive: 'inactive' },
                { new: true }
            );
            if (!updatedGuarantor) {
                return { success: false, message: "Guarantor not found" };
            }
            return { success: true, message: "Guarantor deleted successfully", guarantor: updatedGuarantor };
        } catch (error) {
            console.error("Error soft-deleting guarantor:", error);
            return { success: false, message: error.message };
        }
    }

    static async getGuarantorsByLoanApplicationId(loanApplicationId) {
        try {
            // Validate that the loanApplicationId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(loanApplicationId)) {
                return {
                    success: false,
                    message: "Invalid loan application ID",
                    code: 400,
                };
            }
    
            // Fetch all guarantors associated with the given loan application ID
            const guarantors = await GuarantorsData.find({ loanApplicationId })
    
            if (!guarantors || guarantors.length === 0) {
                return {
                    success: false,
                    message: "No guarantors found for the specified loan application",
                    code: 404,
                };
            }
    
            return {
                success: true,
                guarantors,
            };
        } catch (error) {
            console.error("Error retrieving guarantors by loan application ID:", error);
            return {
                success: false,
                message: error.message,
                code: 500,
            };
        }
    }
}

module.exports = GuarantorsDataService;
