const KYC  = require('../models/kyc');
const LoanProduct = require('../models/loanProduct');
const User = require('../models/user');
const Staff = require('../models/staff');
const Role = require('../models/role');
const loanProduct = require('../models/loanProduct');
const Permission = require('../models/permission');
const bankDetails = require('../models/bankDetails');
const ActivityLogService = require("../services/activityLogService");
const { errorResponse } = require('../utils/responses');
const { generateOTP } = require('../helpers/otp');
const BusinessKYC = require("../models/business_kyc");
const CustomerKYC = require("../models/kyc");
const BVNData = require('../models/bvnData');
const UserService = require('./userService');
const mongoose = require('mongoose');

module.exports = class AdminService{
    static async getAllkyc(){
        try {
            const kycs = await KYC.find();
            // await KYC.deleteMany();
            // await KYC.findByIdAndDelete("6789384e523dbb43dc035111");
            return kycs;
        } catch (error) {
            return error;
        }
    }

    static async createLoanProduct(product_data) {
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
                product_group: product_data.product_group, // Add product_group here
            }
    
            // Create and save the new loan product
            const loanProduct = await new LoanProduct(newloanProduct).save();
    
            // Log the creation activity including product_group
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
                    product_group: product_data.product_group, // Log product_group as well
                }
            );
            return loanProduct;
        } catch (error) {
            console.error('Error creating loan product: ', error);
            return error; // or you can throw the error based on your error-handling strategy
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
            // Find the existing loan product by its ID
            const loanProduct = await LoanProduct.findById(productId);
            if (!loanProduct) {
                return { success: false, message: "Loan product not found" };
            }
    
            // Allowed fields to be updated
            const updatableFields = ["interest", "max", "min", "status", "interest_type", "product_group", "duration"];
            const changes = {};
    
            // Check and collect changes for updatable fields
            updatableFields.forEach((field) => {
                if (updateData[field] !== undefined && loanProduct[field] !== updateData[field]) {
                    changes[field] = {
                        oldValue: loanProduct[field],
                        newValue: updateData[field],
                    };
                    loanProduct[field] = updateData[field]; // Apply the update
                }
            });
    
            // If no changes are detected, return early
            if (Object.keys(changes).length === 0) {
                return { success: false, message: "No changes made to the loan product" };
            }
    
            // Save the updated loan product
            await loanProduct.save();
    
            // Log the activity of updating the loan product
            await ActivityLogService.LogActivity(
                "update",
                "Staff",
                updatedBy,
                "LoanProduct",
                productId,
                changes
            );
    
            return {
                success: true,
                loanProduct,
            };
    
        } catch (error) {
            console.log('Error updating loan product: ', error);
            return { success: false, message: 'Error updating loan product' };
        }
    }
    
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


    static async getAllLoanProducts(accountType){
        try {
            console.log({accountType});
            
            let response = [];
            if(accountType){
                response = await loanProduct.find({product_group: accountType});
            } else {
                response = await loanProduct.find();
            }
        
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

    static async getProductsById(id){
        try {
            const response = await loanProduct.findById(id);
            return response;
        } catch (error) {
            return error;
        }
    }

    static async createUserCustomer(customerData, kycData) {
        const session = await mongoose.startSession(); //start new session
        session.startTransaction(); //init transaction
    
        try {
            const newUser = {
                phone_number: customerData.phone_number,
                otp: "VERIFIED",
                accountType: customerData.accountType,
                email: kycData.email_address,
                otpCreatedAt: Date.now(),
            };
            let kyc = {};
            const email = {
                address: kycData.email_address,
                otp: "VERIFIED",
                otpCreatedAt: Date.now(),
                status: true,
            };
    
            if (customerData.accountType === 'individual') {
                newUser.first_name = customerData.first_name;
                newUser.last_name = customerData.last_name;
    
                //kyc
                const bank_verification_number = {
                    bvn: kycData.bvn,
                    dob: kycData.dob,
                    otp: "VERIFIED",
                    otpCreatedAt: Date.now(),
                    status: true,
                };
    
                const document_verification = {
                    doc_type: kycData.doc_type,
                    doc_no: kycData.doc_no,
                    doc: kycData.doc,
                    status: true,
                };
    
                const address = {
                    address: kycData.address,
                    proof_of_address: kycData.proof_of_address,
                    status: true,
                };
    
                const employment_info = {
                    employment_status: kycData.employment_status,
                    employer_name: kycData.employer_name,
                    employer_phone: kycData.employer_phone,
                    employer_email: kycData.employer_email,
                    employer_address: kycData.employer_address,
                    job_title: kycData.job_title,
                    income_per_period: kycData.income_per_period,
                    status: true,
                };
    
                kyc = {
                    email,
                    bank_verification_number,
                    document_verification,
                    address,
                    employment_info,
                };
    
                const kycDocument = await new CustomerKYC(kyc).save({ session });
                newUser.kyc_verification = kycDocument._id;
            }
    
            if (customerData.accountType === 'business') {
                newUser.business_name = customerData.business_name;
    
                const owners_partner_info = kycData.owners_partner_info;
                const business_section = {
                    address: kycData.business_address,
                    proof_of_address: kycData.proof_of_address,
                    type: kycData.business_type,
                    date_of_corporation: kycData.date_of_corporation,
                    status: true,
                };
                const employee_size = {
                    size: kycData.employee_size,
                    status: true,
                };
                const cac = {
                    number: kycData.cac_number,
                    certificate: kycData.certificate,
                    status: true,
                };
    
                kyc = {
                    email,
                    owners_partner_info,
                    business_section,
                    employee_size,
                    cac,
                };
    
                const kycDocument = await new BusinessKYC(kyc).save({ session });
                newUser.kyc_business = kycDocument._id;
            }
    
            const savedUser = await new User(newUser).save({ session });

            await User.updateOne(
                { phone_number: newUser.phone_number },
                { $set: { is_verified: true } },
                { session }
            );

            //commit transaction
            await session.commitTransaction();
            session.endSession();

            const user = await User.findById(savedUser._id)
                .populate([{ path: "kyc_verification" }, { path: "kyc_business" }])
                .exec();

            console.log("Customer saved successfully", user);
            return { success: true, message: "Customer created successfully", user };
        } catch (error) {
            //rollback transaction on error
            await session.abortTransaction();
            session.endSession();
    
            console.error("Error creating customer account ", error);
            return { success: false, message: "Error creating customer account" };
        }
    }
}