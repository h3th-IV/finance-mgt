const KYC  = require('../models/kyc');
const LoanProduct = require('../models/loanProduct');
const User = require('../models/user');
const Staff = require('../models/staff');
const Role = require('../models/role');

module.exports = class AdminService{
    static async getAllkyc(){
        try {
            const kycs = await KYC.find();
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
                createdBy: product_data.createdBy
            }
            const loanProduct = await new LoanProduct(newloanProduct).save();
            return loanProduct;
        } catch (error) {
            return error;
        }
    }

    static async updateLoanProduct(productId, updateData) {
        try {
            const loanProduct = await LoanProduct.findById(productId);
            if (!loanProduct) {
                return { success: false, message: "Loan product not found" };
            }
            const updatableFields = ["interest", "max", "min"];
            updatableFields.forEach((field) => {
                if (updateData[field] !== undefined) {
                    loanProduct[field] = updateData[field];
                }
            });
            await loanProduct.save();
            return {
                success: true,
                loanProduct,
            };
        } catch (error) {
            console.log('err: ', error);
            return { success: false, message: `Error updating loanProduct` };
        }

    }

    static async createStaff(userId, roleId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return { success: false, message: "User not found" };
            }
            const role = await Role.findById(roleId);
            if (!role) {
                return { success: false, message: "Role not found" };
            }
            const existingStaff = await Staff.findOne({ user: userId });
            if (existingStaff) {
                return { success: false, message: "User is already a staff member." };
            }
            const staff = new Staff({
                user: userId,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: roleId,
            });
            await staff.save();
            return { success: true, staff };
        } catch (error) {
            console.error("Error creating staff:", error);
            return { success: false, message: "Server error" };
        }
    }
}