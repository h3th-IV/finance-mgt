const GuarantorsDataService = require('../services/guarantorsDataService');
const { successResponse, errorResponse } = require("../utils/responses");
const { guarantorValidator } = require('../validators/guarantor.validator');
const {GuarantorsData} = require("../models/guarantorsData");
 class GuarantorsDataController {
    static async createGuarantor(req, res) {
        try {
            const { loanApplicationId } = req.params;
            const { error, value } = guarantorValidator.validate(req.body);
            const files = req.files;
            console.log({ files });
    
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }
    
            const { firstName, middleName, lastName, email, mobile, dateOfBirth, gender, idNumber } = value;

            const data = {
                loanApplicationId,
                firstName,
                middleName,
                lastName,
                email,
                mobile,
                dateOfBirth,
                gender,
                idNumber
            }
            // Check for duplicate entries
            const existingGuarantor = await  GuarantorsDataService.getGuarantorByLoanIdAndEmail(loanApplicationId, email);
            console.log({existingGuarantor});
            
    
            if (existingGuarantor.success === true) {
                return errorResponse(
                    res,
                    409,
                    `A guarantor with email "${email}" for this loan application already exists.`
                );
            }
    
            const response = await GuarantorsDataService.createGuarantor(data, files);
    
            if (!response.success) {
                return errorResponse(res, 500, response.message);
            }
    
            return successResponse(res, 201, "Guarantor created successfully", response.guarantor);
        } catch (error) {
            console.error("Error creating guarantor:", error);
            return errorResponse(res, 500, error.message);
        }
    }
    

    static async getGuarantor(req, res) {
        try {
            const { id } = req.params;
            const response = await GuarantorsDataService.getGuarantorById(id);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }

            return successResponse(res, 200, "Guarantor retrieved successfully", response.guarantor);
        } catch (error) {
            console.error("Error retrieving guarantor:", error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async updateGuarantor(req, res) {
        try {
            const { id } = req.params;
            const { error, value } = guarantorValidator.validate(req.body);
            if (error) {
                return errorResponse(res, 400, error.details[0].message);
            }
            const { firstName, middleName, lastName, email, mobile, dateOfBirth, gender, idNumber } = value;
            const data = {
                firstName,
                middleName,
                lastName,
                email,
                mobile,
                dateOfBirth,
                gender,
                idNumber
            }
            const response = await GuarantorsDataService.updateGuarantor(id, data);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }

            return successResponse(res, 200, "Guarantor updated successfully", response.guarantor);
        } catch (error) {
            console.error("Error updating guarantor:", error);
            return errorResponse(res, 500, error.message);
        }
    }

    //softDelete
    static async deleteGuarantor(req, res) {
        try {
            const { id } = req.params;
            const response = await GuarantorsDataService.deleteGuarantor(id);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }

            return successResponse(res, 200, response.message);
        } catch (error) {
            console.error("Error deleting guarantor:", error);
            return errorResponse(res, 500, error.message);
        }
    }

    static async getGuarantorsForLoanApplication(req, res) {
        try {
            const { id } = req.params; // Loan Application ID
            const response = await GuarantorsDataService.getGuarantorsByLoanApplicationId(id);
    
            if (!response.success) {
                return errorResponse(res, response.code || 404, response.message);
            }
    
            return successResponse(res, 200, "Guarantors retrieved successfully", response.guarantors);
        } catch (error) {
            console.error("Error retrieving guarantors:", error);
            return errorResponse(res, 500, "An unexpected server error occurred.");
        }
    }
}

module.exports = GuarantorsDataController;
