const KYC = require('../models/kyc');
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
const LoanApplication = require('../models/loanApplication');
const Repayment = require('../models/repayment');

module.exports = class AdminService {
    static async getAllkyc() {
        try {
            const kycs = await KYC.find();
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
                product_group: product_data.product_group,
            }

            const loanProduct = await new LoanProduct(newloanProduct).save();
            const req_staff = await Staff.findById(product_data.createdBy)
            const req_s = await Staff.findById("67adb949b4c4438a2089f203")
            const name = `${req_staff.first_name} ${req_staff.last_name}`;

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
                    product_group: product_data.product_group,
                    message: `Loan product ${product_data.name}, created by Staff, ${name}`
                }
            );
            return loanProduct;
        } catch (error) {
            console.error('Error creating loan product: ', error);
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
            const staff = await Staff.findById(updatedBy);
            const name = `${staff.first_name} ${staff.last_name}`;

            //allowed fields to be updated
            const updatableFields = ["interest", "max", "min", "status", "interest_type", "product_group", "duration"];
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
            changes.message = `Loan Product ${loanProduct.name} was updated by Staff, ${name}`

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


    static async getAllLoanProducts(accountType) {
        try {
            console.log({ accountType });

            let response = [];
            if (accountType) {
                response = await loanProduct.find({ product_group: accountType });
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
            console.error(error)
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
        try {
            // await Role.deleteMany();
            return await Role.find();
        } catch (error) {
            throw new Error('Error fetching roles');
        }
    }

    static async getStaffs() {
        try {
            const staff = await Staff.find().populate('role');
            // await Staff.deleteMany();
            return staff;
        } catch (error) {
            throw new Error('Error fetching staffs');
        }
    }

    static async getStaffById(id) {
        try {
            
            const staff = await Staff.findById(id).populate('role');
            return staff;
        } catch (error) {
            throw new Error('Error fetching staffs');
        }
    }

    static async getStaffWithPerm(permission) {
        try {
            const normalizedPermission = permission.toUpperCase();
    
            const staff = await Staff.find().populate('role');
    
            const filteredStaff = staff.filter(member => 
                member.role && member.role.permissions.includes(normalizedPermission)
            );
    
            if (filteredStaff.length === 0) {
                return {
                    success: false,
                    message: "No staff found with the given permission.",
                    code: "NOT_FOUND",
                };
            }
            return {
                success: true,
                message: "Staff with the specified permission fetched successfully.",
                staff: filteredStaff,
            };
        } catch (error) {
            console.error("Error fetching staff with permission:", error);
            return {
                success: false,
                message: `Error: ${error.message}`,
                code: "INTERNAL_ERROR",
            };
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

    static async getProductsById(id) {
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
                    certificate: kycData.cac_certificate,
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

    static async getRoleById(id) {
        try {
            return await Role.findById(id);
        } catch (error) {
            throw new Error('Error fetching roles');
        }
    }

    // static async getActiveLoansCount(dateFilter) {
    //     try {
    //         const query = { status: "processing" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const activeLoans = await LoanApplication.countDocuments(query);
    //         return {
    //             success: true,
    //             data: activeLoans,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching active loans:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching active loans.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // static async getDelinquentLoansCounts(dateFilter) {
    //     try {
    //         const query = { status: "overdue" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const delinquentLoans = await LoanApplication.countDocuments(query);
    //         return {
    //             success: true,
    //             data: delinquentLoans,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching delinquent loans:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching delinquent loans.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // static async getLoansReadyToDisburseCount(dateFilter) {
    //     try {
    //         const query = { status: "ready_for_disbursement" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const loansReadyToDisburse = await LoanApplication.countDocuments(query);
    //         return {
    //             success: true,
    //             data: loansReadyToDisburse,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching loans ready to disburse:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching loans ready to disburse.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // static async getTotalLoanAmount(dateFilter) {
    //     try {
    //         const query = {};
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const totalLoanAmount = await LoanApplication.aggregate([
    //             { $match: query },
    //             { $group: { _id: null, total: { $sum: "$loan_amount" } } },
    //         ]);
    //         return {
    //             success: true,
    //             data: totalLoanAmount[0]?.total || 0,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching total loan amount:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching total loan amount.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // static async getTotalBusinessLoansAmount(dateFilter) {
    //     try {
    //         const query = { loan_type: "business" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const totalBusinessLoans = await LoanApplication.aggregate([
    //             { $match: query },
    //             { $group: { _id: null, total: { $sum: "$loan_amount" } } },
    //         ]);
    //         return {
    //             success: true,
    //             data: totalBusinessLoans[0]?.total || 0,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching total business loans:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching total business loans.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }


    // static async getTotalIndividualLoansAmount(dateFilter) {
    //     try {
    //         const query = { loan_type: "individual" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const totalIndividualLoans = await LoanApplication.aggregate([
    //             { $match: query },
    //             { $group: { _id: null, total: { $sum: "$loan_amount" } } },
    //         ]);
    //         return {
    //             success: true,
    //             data: totalIndividualLoans[0]?.total || 0,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching total individual loans:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching total individual loans.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // static async getTotalFullyPaidLoans(dateFilter) {
    //     try {
    //         const query = { status: "fully_paid" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const totalFullyPaidLoans = await LoanApplication.countDocuments(query);
    //         return {
    //             success: true,
    //             data: totalFullyPaidLoans,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching total fully paid loans:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching total fully paid loans.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // static async getTotalRepaidAmount(dateFilter) {
    //     try {
    //         const query = {};
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const totalRepaidAmount = await Repayment.aggregate([
    //             { $match: query },
    //             { $group: { _id: null, total: { $sum: "$amount" } } },
    //         ]);
    //         return {
    //             success: true,
    //             data: totalRepaidAmount[0]?.total || 0,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching total repaid amount:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching total repaid amount.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    // //loan product pie chart
    // static async getLoanProductDistribution(dateFilter) {
    //     try {
    //         const query = {};
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const loanProductDistribution = await LoanApplication.aggregate([
    //             { $match: query },
    //             { $group: { _id: "$loan_product", count: { $sum: 1 } } },
    //             { $lookup: { from: "loanproducts", localField: "_id", foreignField: "_id", as: "loan_product" } },
    //             { $unwind: "$loan_product" },
    //             { $project: { _id: 0, loan_product: "$loan_product.name", count: 1 } },
    //         ]);
    //         return {
    //             success: true,
    //             data: loanProductDistribution,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching loan product distribution:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching loan product distribution.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }
    
    // //delquent rate graph
    // static async fetchAllLoanData(dateFilter) {
    //     try {
    //         const query = { status: "overdue" };
    //         if (dateFilter) {
    //             query.createdAt = { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) };
    //         }
    //         const delinquencyRateOverTime = await LoanApplication.aggregate([
    //             { $match: query },
    //             {
    //                 $group: {
    //                     _id: {
    //                         year: { $year: "$createdAt" },
    //                         month: { $month: "$createdAt" },
    //                     },
    //                     count: { $sum: 1 },
    //                 },
    //             },
    //             { $sort: { "_id.year": 1, "_id.month": 1 } },
    //             { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1 } },
    //         ]);
    //         return {
    //             success: true,
    //             data: delinquencyRateOverTime,
    //         };
    //     } catch (error) {
    //         console.error("Error fetching delinquency rate over time:", error);
    //         return {
    //             success: false,
    //             message: "An unexpected error occurred while fetching delinquency rate over time.",
    //             code: "SERVER_ERROR",
    //         };
    //     }
    // }

    static async getAllLoanStats(dateFilter) {
        try {
            const queryFilter = dateFilter && dateFilter.start && dateFilter.end ? { createdAt: { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) } } : {};
        
            const [
                activeLoansCount,
                delinquentLoansCount,
                loansReadyToDisburseCount,
                totalLoanAmount,
                totalBusinessLoansAmount,
                totalIndividualLoansAmount,
                totalFullyPaidLoans,
                totalRepaidAmount,
                totalLoanCount, // Total count of loans for percentage calculation
                loanProductDistribution,
                delinquencyRateOverTime,
                loanAmountPerMonth, // New addition for loan amounts per month
                loanAmountPerWeek, // New addition for loan amounts per week
                loanAmountAllYears // New addition for loan amounts across all years
            ] = await Promise.all([
                LoanApplication.countDocuments({ ...queryFilter, status: "processing" }),
                LoanApplication.countDocuments({ ...queryFilter, status: "overdue" }),
                LoanApplication.countDocuments({ ...queryFilter, status: "ready_for_disbursement" }),
                LoanApplication.aggregate([
                    { $match: queryFilter },
                    { $group: { _id: null, total: { $sum: "$loan_amount" } } }
                ]),
                LoanApplication.aggregate([
                    { $match: { ...queryFilter, loan_type: "business" } },
                    { $group: { _id: null, total: { $sum: "$loan_amount" } } }
                ]),
                LoanApplication.aggregate([
                    { $match: { ...queryFilter, loan_type: "individual" } },
                    { $group: { _id: null, total: { $sum: "$loan_amount" } } }
                ]),
                LoanApplication.countDocuments({ ...queryFilter, status: "fully_paid" }),
                Repayment.aggregate([
                    { $match: queryFilter },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]),
                LoanApplication.countDocuments(queryFilter), // Get the total count of loans
                LoanApplication.aggregate([
                    { $match: queryFilter },
                    { $group: { _id: "$loan_product", count: { $sum: 1 } } },
                    { $lookup: { from: "loanproducts", localField: "_id", foreignField: "_id", as: "loan_product" } },
                    { $unwind: "$loan_product" },
                    { $project: { _id: 0, loan_product: "$loan_product.name", count: 1 } }
                ]),
                LoanApplication.aggregate([
                    { $match: { ...queryFilter, status: "overdue" } },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } },
                    { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1 } }
                ]),
    
                // Loan Amount per Month (January to December)
                LoanApplication.aggregate([
                    { $match: queryFilter },
                    { $group: {
                        _id: { $month: "$createdAt" }, 
                        totalLoanAmount: { $sum: "$loan_amount" }
                    }},
                    { $sort: { "_id": 1 } }, // Sort by month (1 - January, 12 - December)
                    { $project: { month: "$_id", totalLoanAmount: 1, _id: 0 } }
                ]),
    
                // Loan Amount per Week (Monday to Sunday)
                LoanApplication.aggregate([
                    { $match: queryFilter },
                    { $group: {
                        _id: { $week: "$createdAt" }, 
                        totalLoanAmount: { $sum: "$loan_amount" }
                    }},
                    { $sort: { "_id": 1 } }, // Sort by week
                    { $project: { week: "$_id", totalLoanAmount: 1, _id: 0 } }
                ]),
    
                // Loan Amount for All Years
                LoanApplication.aggregate([
                    { $match: queryFilter },
                    { $group: {
                        _id: { $year: "$createdAt" }, 
                        totalLoanAmount: { $sum: "$loan_amount" }
                    }},
                    { $sort: { "_id": 1 } }, // Sort by year
                    { $project: { year: "$_id", totalLoanAmount: 1, _id: 0 } }
                ])
            ]);
        
            // Calculate percentages for loanProductDistribution
            const loanProductDistributionWithPercentages = loanProductDistribution.map(product => ({
                loan_product: product.loan_product,
                count: product.count,
                percentage: totalLoanCount > 0 ? ((product.count / totalLoanCount) * 100).toFixed() : 0
            }));
        
            return {
                success: true,
                data: {
                    activeLoansCount,
                    delinquentLoansCount,
                    loansReadyToDisburseCount,
                    totalLoanAmount: totalLoanAmount[0]?.total || 0,
                    totalBusinessLoansAmount: totalBusinessLoansAmount[0]?.total || 0,
                    totalIndividualLoansAmount: totalIndividualLoansAmount[0]?.total || 0,
                    totalFullyPaidLoans,
                    totalRepaidAmount: totalRepaidAmount[0]?.total || 0,
                    loanProductDistribution: loanProductDistributionWithPercentages,
                    delinquencyRateOverTime,
                    loanAmountPerMonth, // Loan amount for each month (January to December)
                    loanAmountPerWeek, // Loan amount for each week (Monday to Sunday)
                    loanAmountAllYears // Loan amount for all years
                }
            };
        } catch (error) {
            console.error("Error fetching loan stats:", error);
            return {
                success: false,
                message: "An unexpected error occurred while fetching loan stats.",
                code: "SERVER_ERROR"
            };
        }
    }
    

    static async getUserStats(dateFilter) {
        try {
            // Filter by date range if provided
            const queryFilter = dateFilter && dateFilter.start && dateFilter.end 
                ? { createdAt: { $gte: new Date(dateFilter.start), $lte: new Date(dateFilter.end) } } 
                : {};
    
            const [
                totalUsersCount,
                totalIndividualUsersCount,
                totalBusinessUsersCount,
                totalVerifiedUsersCount,
                totalUnverifiedUsersCount,
                totalOTPGeneratedCount,
                totalUsersWithKYC,
                totalUsersWithProfilePicture,
                userAccountTypeDistribution
            ] = await Promise.all([
                User.countDocuments(queryFilter), // Total number of users
                User.countDocuments({ ...queryFilter, accountType: "individual" }), // Total number of individual users
                User.countDocuments({ ...queryFilter, accountType: "business" }), // Total number of business users
                User.countDocuments({ ...queryFilter, is_verified: true }), // Total verified users
                User.countDocuments({ ...queryFilter, is_verified: false }), // Total unverified users
                User.countDocuments({ ...queryFilter, otp: { $exists: true } }), // Total users who generated OTP
                User.countDocuments({ ...queryFilter, kyc_verification: { $exists: true } }), // Total users with KYC
                User.countDocuments({ ...queryFilter, profilePicture: { $exists: true } }), // Total users with profile picture
                User.aggregate([
                    { $match: queryFilter },
                    { $group: { _id: "$accountType", count: { $sum: 1 } } },
                    { $project: { _id: 0, accountType: "$_id", count: 1 } }
                ]) // Count of users by account type (individual vs business)
            ]);
    
            // Calculate percentages for accountTypeDistribution
            const accountTypeDistributionWithPercentages = userAccountTypeDistribution.map(type => ({
                accountType: type.accountType,
                count: type.count,
                percentage: totalUsersCount > 0 ? ((type.count / totalUsersCount) * 100).toFixed(2) : 0
            }));
    
            return {
                success: true,
                data: {
                    totalUsersCount,
                    totalIndividualUsersCount,
                    totalBusinessUsersCount,
                    totalVerifiedUsersCount,
                    totalUnverifiedUsersCount,
                    totalOTPGeneratedCount,
                    totalUsersWithKYC,
                    totalUsersWithProfilePicture,
                    accountTypeDistribution: accountTypeDistributionWithPercentages
                }
            };
        } catch (error) {
            console.error("Error fetching user stats:", error);
            return {
                success: false,
                message: "An unexpected error occurred while fetching user stats.",
                code: "SERVER_ERROR"
            };
        }
    }
    
}