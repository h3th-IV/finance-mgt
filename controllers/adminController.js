const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/responses');
const { createLoanProductSchema, updateLoanProductSchema } = require('../validators/loanProduct.validator');
const { loginValidator } = require('../validators/user.validator');
const User = require("../models/user")
const bcryptjs = require("bcryptjs");
const Staff = require('../models/staff');


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

    static async createStaff(req, res) {
        const { userId, roleId } = req.body;
        const result = await AdminService.createStaff(userId, roleId);

        if (!result.success) {
            return errorResponse(res, 400, result.message);
        }
        return successResponse(res, 201, "User designated as staff", result.staff);
    }

    //login for admin routes
    static async login(req, res){
        const { error } = loginValidator.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }
        const { identifier, password } = req.body;
        try{
            const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { phone_number: identifier };
            const user = await User.findOne(query);
            if (!user) {
                return errorResponse(res, 401, `User with ${query.email ? "email" : "phone_number"} not found`);
            }
            const isPassword = await bcryptjs.compare(password, user.password);
            if(!isPassword) {
                return errorResponse(res, 401, "Incorrect password");
            }
            const staff = await Staff.findOne({ user: user._id }).populate('role');
            if(!staff) {
                return errorResponse(res, 403, "Access denied");
            }
            const token = staff.generateStaffToken();
            const response = {
                token,
                staff: {
                    id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    permissions: staff.role.permissions
                },
            }
            return successResponse(res, 200, "Staff signed in successfully", response);
        } catch (error) {
            return errorResponse(res, 500, 'Sever error');
        }
    }

    static async getAllLoanProducts(req, res){
        try {
            const response = await AdminService.getAllLoanProducts();
            return successResponse(res, 200, "All loan product returned successfully", response);
        } catch (error) {
            return errorResponse(res,   500, "Server error");
        }
    }

    static async createLoanPermission(req, res){
        try{
        } catch(error) {
        }
    }
}