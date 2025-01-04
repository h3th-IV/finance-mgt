const KYC  = require('../models/kyc');
const LoanProduct = require('../models/loanProduct');
const User = require('../models/user');
const Staff = require('../models/staff');
const Role = require('../models/role');
const loanProduct = require('../models/loanProduct');
const Permission = require('../models/permission');
const bankDetails = require('../models/bankDetails');
const ActivityLogService = require("../services/activityLogService");

module.exports = class AdminService{
    static async getAllkyc(){
        try {
            const kycs = await KYC.find();
            // await KYC.deleteMany();
            return kycs;
        } catch (error) {
            return error;
        }
    }

    static async createLoanProduct(product_data){
        try {
            const newloanProduct = {
                name: product_data.name,
                desc: product_data.desc,
                interest: product_data.interest,
                max: product_data.max,
                min: product_data.min,
                createdBy: product_data.createdBy,
                interest_type: product_data.interest_type,
                duration: product_data.duration,
            }
            const loanProduct = await new LoanProduct(newloanProduct).save();

            await ActivityLogService.LogActivity(
                "create",
                "Staff",
                product_data.createdBy,
                "LoanProduct",
                loanProduct._id,
                {
                    name: product_data.name,
                    interest: product_data.interest,
                    max: product_data.max,
                    min: product_data.min,
                    interest_type: product_data.interest_type,
                    duration: product_data.duration,
                }
            );
            return loanProduct;
        } catch (error) {
            return error;
        }
    }

    static async getLoanProduct(productId) {
        try {
            const product = await LoanProduct.findById(productId);
            if (!product) {
                return { success: false, message: "Loan Product not found" };
            }
    
            const productActivity = await ActivityLogService.getActivityLogs("LoanProduct", productId);
    
            return { 
                success: true, 
                message: "Loan Product returned successfully", 
                data: {
                    product,
                    productActivity: productActivity.success ? productActivity.data : [],
                } 
            };
        } catch (error) {
            console.error("Error getting loan product: ", error);
            return { success: false, message: "Error fetching loan product" };
        }
    }
    

    static async updateLoanProduct(productId, updateData, updatedBy) {
        try {
            const loanProduct = await LoanProduct.findById(productId);
            if (!loanProduct) {
                return { success: false, message: "Loan product not found" };
            }
            const updatableFields = ["interest", "max", "min"];
            const changes = {};
            updatableFields.forEach((field) => {
                if (updateData[field] !== undefined && loanProduct[field] !== updateData[field]) {
                    changes[field] = {
                        oldValue: loanProduct[field],
                        newValue: updateData[field],
                    };
                    loanProduct[field] = updateData[field];
                }
            });
            if (Object.keys(changes).length === 0) {
                return { success: false, message: "No changes made to the loan product" };
            }
            await loanProduct.save();
            await ActivityLogService.LogActivity(
                "update",
                "Staff",
                updatedBy,
                "LoanProduct",
                productId,
                changes
            )
            return {
                success: true,
                loanProduct,
            };
        } catch (error) {
            console.log('Error updating loan product: ', error);
            return { success: false, message: `Error updating loanProduct` };
        }

    }

//test commit here
    static async createStaff({ first_name, last_name, email, dob, roleId, otp }) {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                return { success: false, message: "Role not found" };
            }

            const existingStaff = await Staff.findOne({ email });
            if (existingStaff) {
                return { success: false, message: "Staff with this email already exists." };
            }

            const staff = new Staff({ first_name, last_name, email, dob, role: roleId, otp });
            const staffData = {
                staff,
                role_name: role.name,
            }
            await staff.save();
            const response = { success: true, staffData };
            return response;
        } catch (error) {
            console.error("Error creating staff:", error);
            return { success: false, message: "Server error" };
        }
    }


    static async getAllLoanProducts(){
        try {
            const response = await loanProduct.find();
            // await loanProduct.deleteMany();
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getAllPermissions() {
        try {
            return await Permission.find({}, 'name').lean();
        } catch (error) {
            throw new Error("Error fetching permissions");
        }
    }

    static async createRole(roleData) {
        try {
            const role = new Role(roleData);
            await role.save();
            return role;
        } catch (error) {
            throw new Error("Error creating role");
        }
    }

    static async getAllPermissionsData() {
        try {
            return await Permission.find();
        } catch (error) {
            throw new Error("Error fetching permissions");
        }
    }

    static async getRoles() {
        try{
            // await Role.deleteMany();
            return await Role.find();
        } catch(error){
            throw new Error('Error fetching roles');
        }
    }

    static async getStaffs(){
        try{
            const staff = await Staff.find().populate('role');
            // await Staff.deleteMany();
            return staff;
        } catch(error){
            throw new Error('Error fetching staffs');
        }
    }

    static async updatePassword(staffId, otp, pass) {
        try {
            const staff = await Staff.findById(staffId);
            if (!staff) {
                return { success: false, message: "Staff not found" };
            }
            if (staff.isOTPExpired()) {
                await staff.clearOTPIfExpired();
                return { success: false, message: "OTP has expired" };
            }
            if (staff.otp !== otp) {
                return { success: false, message: "Invalid OTP" };
            }
            staff.password = pass;
            staff.otp = "EXPIRED";
            await staff.save();
            return { success: true, message: "Password updated successfully", staff };
        } catch (error) {
            console.error("Error updating staff password:", error);
            throw new Error("Error updating staff password");
        }
    }

    static async archiveLoanProduct(productId, archivedBy) {
        try {
            const loanProduct = await LoanProduct.findByIdAndUpdate(
                productId,
                { status: "archived" },
                { new: true }
            );
            if (!loanProduct) {
                return { success: false, message: "Loan product not found" };
            }
            if (loanProduct.status === "archived") {
                return { success: false, message: "Loan product is already archived" };
            }

            const oldStatus = loanProduct.status;
            loanProduct.status = "archived";
            await loanProduct.save();

            await ActivityLogService.LogActivity(
                "archive",
                "Staff",
                archivedBy,
                "LoanProduct",
                productId,
                { oldStatus, newStatus: "archived" }
            );
            return {
                success: true,
                message: "Loan product archived successfully",
                data: loanProduct,
            };
        } catch (error) {
            console.error("Error archiving loan product:", error);
            return { success: false, message: "Error archiving loan product" };
        }
    }

    static async getAllBankDetails() {
        try {
            const allBankDetails = await bankDetails.find().populate('user', 'name email');
            return { success: true, data: allBankDetails };
        } catch (error) {
            console.error("Error fetching all bank details: ", error.message);
            return { success: false, message: "An error occurred while fetching bank details." };
        }
    }
}