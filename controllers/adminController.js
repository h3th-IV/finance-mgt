const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/responses');
const { createLoanProductSchema, updateLoanProductSchema } = require('../validators/loanProduct.validator');
const { loginValidator } = require('../validators/user.validator');
const User = require("../models/user")
const bcryptjs = require("bcryptjs");
const Staff = require('../models/staff');
const { validateCreateRole } = require('../validators/rolePerm.validator');
const { staffValidator } = require("../validators/staff.validator");
const { generateOTP} = require('../helpers/otp');
const mailer = require("../config/mailer");
const { updatePasswordValidator } = require('../validators/staffUpdate.validator');
const BVNDataService = require('../services/bvnDataService');
// const { smsOTP } = require('../config/messenger');


module.exports = class AdminController{
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
        try {
            const { error } = staffValidator.validate(req.body, { abortEarly: false });
            if (error) {
                const errorMessages = error.details.map((err) => err.message);
                return errorResponse(res, 400, "Validation error", { errors: errorMessages });
            }
            
            const { first_name, last_name, email, dob, role } = req.body;
            const otp = generateOTP()

            const response = await AdminService.createStaff({
                first_name,
                last_name,
                email,
                dob,
                roleId: role,
                otp,
            });

            if (!response.success) {
                return errorResponse(res, 400, response.message);
            }
            const staffId = response.staffData.staff._id;
            const role_name = response.staffData.role_name
            mailer.sendStaffOTPEmail(email, first_name, otp, role_name, staffId);
            return successResponse(res, 201, "Staff created successfully.", response.staffData);    
        } catch (error) {
            console.error("Error creating staff:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async updatePassword(req, res) {
        try {
            const dataToValidate = {
                staffId: req.query.staffId,
                otp: req.query.otp || req.body.otp,
                pass: req.body.pass,
            };
            const { error } = updatePasswordValidator.validate(dataToValidate, { abortEarly: false });
            if (error) {
                const errorMessages = error.details.map((err) => err.message);
                return errorResponse(res, 400, "Validation error", { errors: errorMessages });
            }

            const { staffId, otp, pass } = dataToValidate;
            const response = await AdminService.updatePassword(staffId, otp, pass);
            if (!response.success){
                return errorResponse(res, 400, response.message)
            }
            return successResponse(res, 200, "Password has been updated successfully", response.staff);
        } catch (error) {
            return errorResponse(res, 500, "Server error")
        }
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
            const staff = await Staff.findOne(query).populate('role');
            if (!staff) {
                return errorResponse(res, 401, `Staff with ${query.email ? "email" : "phone_number"} not found`);
            }
            const isPassword = await bcryptjs.compare(password, staff.password);
            if(!isPassword) {
                return errorResponse(res, 401, "Incorrect password");
            }
            if(!staff.role) {
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

    static async createRolePermission(req, res) {
        const { name, permissions } = req.body;

        try {
            //get d valid permissions from the database
            const validPermissions = await AdminService.getAllPermissions();
            const permissionNames = validPermissions.map((perm) => perm.name);

            const { error } = validateCreateRole({ name, permissions }, permissionNames);
            if (error) {
                const errors = error.details.map((detail) => detail.message);
                return errorResponse(res, 400, "Validation error", errors);
            }
            const roleData = { name, permissions };
            const role = await AdminService.createRole(roleData);
            return successResponse(res, 201, "Role created successfully and permissions granted", role);
        } catch (error) {
            return errorResponse(res, 500, "Server error", error.message);
        }
    }

    static async getAllPermissions(req, res) {
        try {
            const permissions = await AdminService.getAllPermissionsData();
            if (!permissions || permissions.length === 0) {
                return errorResponse(res, 404, "No permissions found");
            }
            return successResponse(res, 200, "Permissions fetched successfully", permissions);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            return errorResponse(res, 500, "Server error while fetching permissions");
        }
    }

    static async getAllRoles(req, res) {
        try {
            const roles = await AdminService.getRoles();
            if (!roles || roles.length === 0) {
                return errorResponse(res, 404, "No roles found");
            }
            return successResponse(res, 200, "Roles fetched successfully", roles);
        } catch (error) {
            console.error("Error fetching roles:", error);
            return errorResponse(res, 500, "Server error while fetching roles");
        }
    }

    static async getAllStaffs(req, res){
        try{
            const staffs = await AdminService.getStaffs();
            return successResponse(res, 200, "Staff returned successfully", staffs);
        } catch(error){
            return errorResponse(res, 500, "Server error while fetching staffs");
        }
    }

    static async sendSMS(req, res){
        try{
            const response = await smsOTP('2347035643850', '44444');
            if (!response.success){
                return successResponse(res, 400, "Error", response.message);
            }
            return successResponse(res, 200, "Success", response.message);
        } catch(error){
            return errorResponse(res, 500, 'Server error');
        }
    }

    static async getAllBVNData(req, res){
        try{
            const response = await BVNDataService.getAllBVNData();
            if (!response.success){
                return errorResponse(res, 400, "Error", response.message);
            }
            return successResponse(res, 200, response.message, response.bvnData);
        }catch(error){
            return errorResponse(res, 500, 'Server error');
        }
    }
}   