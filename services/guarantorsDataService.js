const GuarantorsData = require('../models/guarantorsData');

class GuarantorsDataService {
    static async createGuarantor(data, files) {
        try {
            const guarantorData = {
                ...data,
                file: files["file"]?.[0]?.path || null
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
}

module.exports = GuarantorsDataService;
