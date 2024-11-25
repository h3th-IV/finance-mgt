const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/responses');
const { createLoanProductSchema, updateLoanProductSchema } = require('../validators/loanProduct.validator');

module.exports = class AdminCOntroller{
    static async getAllkycs(req, res) {
        try{
            const kycs = await AdminService.getAllkyc();
            return successResponse(res, 200, "KYCs returned successfully", kycs);
        } catch(error){
            return errorResponse(res, 500, "Server error");
        }
    }

    static async createLoanProduct(req, res) {
        const userId = req.params.userId;
        const { error } = createLoanProductSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }
        const { name, description, interest, max, min } = req.body;
        try {
            const product_data = {
                name: name,
                desc: description,
                interest: interest,
                max: max,
                min: min,
                createdBy: userId,
            };
            const loanProduct = await AdminService.createLoanProduct(product_data);
            return successResponse(res, 201, "Loan product created successfully", loanProduct);
        } catch (error) {
            return errorResponse(res, 500, "Server error");
        }
    }

    static async updateLoanProduct(req, res) {
        const productId = req.params.productId;
        const { error } = updateLoanProductSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }
        const updateData = req.body;
        try {
            if (!productId) {
                return errorResponse(res, 400, "Loan productId is required");
            }
            const response = await AdminService.updateLoanProduct(productId, updateData);
            if (!response.success) {
                return errorResponse(res, 400, "Error updating loan product", response);
            }
            return successResponse(res, 200, "Loan product updated successfully", response);
        } catch (error) {
            console.error("Error updating loan product:", error);
            return errorResponse(res, 500, "Server error");
        }
    }
}