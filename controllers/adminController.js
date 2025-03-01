const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/responses');
const { createLoanProductSchema, updateLoanProductSchema } = require('../validators/loanProduct.validator');
const { loginValidator } = require('../validators/user.validator');
const User = require("../models/user")
const bcryptjs = require("bcryptjs");
const Staff = require('../models/staff');
const { validateCreateRole } = require('../validators/rolePerm.validator');
const { staffValidator } = require("../validators/staff.validator");
const { generateOTP } = require('../helpers/otp');
const mailer = require("../config/mailer");
const { updatePasswordValidator } = require('../validators/staffUpdate.validator');
const BVNDataService = require('../services/bvnDataService');
const { listenerCount } = require('../models/loanApplication');
const verifyBVN = require('../helpers/verifyBVN');
const { customerDataValidators, kycDataValidators } = require('../validators/adminCustomerValidator');
const KYC = require("../models/kyc");
const BVNData = require('../models/bvnData');
const UserService = require('../services/userService');
const mongoose = require('mongoose')
const creditReport = require('../helpers/credit_report.helper');
const CreditReportService = require('../services/creditReportService');
const uploadToCloudinary = require('../utils/uploader');
const sendSMSOTP = require('../helpers/messenger');
// const { smsOTP } = require('../config/messenger');


module.exports = class AdminController {
    static async getAllkycs(req, res) {
        try {
            const kycs = await AdminService.getAllkyc();
            return successResponse(res, 200, "KYCs returned successfully", kycs);
        } catch (error) {
            return errorResponse(res, 500, "Server error");
        }
    }

    // Create Loan Product
    static async createLoanProduct(req, res) {
        const { id } = req.user;
        const { error } = createLoanProductSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const { name, description, interest, max, min, interest_type, duration, product_group } = req.body;

        try {
            const product_data = {
                name,
                desc: description,
                interest,
                max,
                min,
                createdBy: id,
                interest_type,
                duration,
                product_group,
            };
            const loanProduct = await AdminService.createLoanProduct(product_data);
            console.log("Loan Product Created:", loanProduct);

            return successResponse(res, 201, "Loan product created successfully", loanProduct);

        } catch (error) {
            console.error("Error creating loan product:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async updateLoanProduct(req, res) {
        const { id } = req.user;
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
            const response = await AdminService.updateLoanProduct(productId, updateData, id);
            if (!response.success) {
                return errorResponse(res, 400, response.message || "Error updating loan product");
            }
            return successResponse(res, 200, "Loan product updated successfully", response.loanProduct);

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
            if (!response.success) {
                return errorResponse(res, 400, response.message)
            }
            return successResponse(res, 200, "Password has been updated successfully", response.staff);
        } catch (error) {
            return errorResponse(res, 500, "Server error")
        }
    }

    //login for admin routes for staffs
    static async login(req, res) {
        const { error } = loginValidator.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }
        const { identifier, password } = req.body;
        console.log(identifier)
        try {
            const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { phone_number: identifier };
            const staff = await Staff.findOne(query).populate('role');
            if (!staff) {
                return errorResponse(res, 401, `Staff with ${query.email ? "email" : "Phone Number"} not found`);
            }
            const isPassword = await bcryptjs.compare(password, staff.password);
            if (!isPassword) {
                return errorResponse(res, 401, "Incorrect password");
            }
            if (!staff.role) {
                return errorResponse(res, 403, "Access denied");
            }
            // const otp = generateOTP()
            // staff.login_otp = otp;
            // await staff.save();
            // await mailer.sendLoginOTPEmail(staff.email, staff.first_name, null, otp);
            const token = staff.generateStaffToken();
            const response = {
                token,
                staff: {
                    id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    permissions: staff.role.permissions,
                    accountType: "admin"
                },
            }
            // return successResponse(res, 200, "An otp has been sent to your email address");
            return successResponse(res, 200, "Login successful", response);
        } catch (error) {
            return errorResponse(res, 500, 'Sever error');
        }
    }
    
    static async loginOTPValidation(req, res){
        const { staffId } = req.params;
        const { otp } = req.body;
        try{
            const staff = await Staff.findById(staffId);
            if(staff.login_otp !== otp){
                console.error("invalid otp")
                return errorResponse(res, 400, "Invalid otp")
            }
            staff.login_otp = "LOGGEDIN"
            await staff.save()
            const token = staff.getSignedJwtToken();
            const response = {
                staff,
                jwToken: token,
            }
            return successResponse(res, 200, "login successful", response)
        }catch(error){
            console.error("An error occurred, ", error)
            return errorResponse(res, 500, "Server Error")
        }
    }


    static async getAllLoanProducts(req, res) {
        try {
            let response = []
            if (req?.query.accountType === "admin") {
                response = await AdminService.getAllLoanProducts();
            } else {
                response = await AdminService.getAllLoanProducts(req?.query?.accountType);
            }
           
            return successResponse(res, 200, "All loan product returned successfully", response);
        } catch (error) {
            return errorResponse(res, 500, "Server error");
        }
    }



    static async createRolePermission(req, res) {
        const { name, permissions } = req.body;

        try {
            //get d valid permissions from the database
            const validPermissions = await AdminService.getAllPermissions();
            console.log("valid permission", validPermissions)
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
            console.error(error)
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

    static async getAllStaffs(req, res) {
        try {
            const staffs = await AdminService.getStaffs();
            return successResponse(res, 200, "Staff returned successfully", staffs);
        } catch (error) {
            return errorResponse(res, 500, "Server error while fetching staffs");
        }
    }

    static async sendSMS(req, res) {
        try {
            const response = await smsOTP('2347035643850', '44444');
            if (!response.success) {
                return successResponse(res, 400, "Error", response.message);
            }
            return successResponse(res, 200, "Success", response.message);
        } catch (error) {
            return errorResponse(res, 500, 'Server error');
        }
    }

    static async getAllBVNData(req, res) {
        try {
            const response = await BVNDataService.getAllBVNData();
            if (!response.success) {
                return errorResponse(res, 400, "Error", response.message);
            }
            return successResponse(res, 200, response.message, response.bvnData);
        } catch (error) {
            return errorResponse(res, 500, 'Server error');
        }
    }

    static async getSingleBVNData(req, res) {
        const bvn = req.body.bvn;
        try {
            const response = await BVNDataService.getSingleBVNData(bvn);
            if (!response.success) {
                return errorResponse(res, 400, "Error", response.message)
            }
            return successResponse(res, 200, response.message, response.bvnDatum);
        } catch (error) {
            return errorResponse(res, 500, 'Server error');
        }
    }

    static async archiveLoanProduct(req, res) {
        const { id } = req.user;
        try {
            const { productId } = req.params;
            const response = await AdminService.archiveLoanProduct(productId, id);
            if (!response.success) {
                return errorResponse(res, 404, response.message);
            }
            return successResponse(res, 200, response.message, response.data);
        } catch (error) {
            console.error("Error in archive LoanProduct controller: ", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async getAllBankDetails(req, res) {
        try {
            const response = await AdminService.getAllBankDetails();
            if (!response.success) {
                return errorResponse(res, 400, response.message);
            }
            return successResponse(res, 200, "All bank details fetched successfully.", response.data);
        } catch (error) {
            console.error("Controller error (getAllBankDetails): ", error.message);
            return errorResponse(res, 500, "Internal Server Error");
        }
    }

    static async getLoanProduct(req, res) {
        const { productId } = req.params;
        try {
            if (!productId) {
                return errorResponse(res, 400, 'Missing productId')
            }
            const response = await AdminService.getLoanProduct(productId);
            if (!response.success) {
                return errorResponse(res, response.message === 'Loan Product not found' ? 404 : 400, response.message);
            }
            return successResponse(res, 200, 'Loan product returned successfully', response.data);
        } catch (error) {
            console.error('Error fetching product', error)
            return errorResponse(res, 500, 'Internal server Error');
        }
    }

    static async createCustomer(req, res) {
        try {
            const { customer, kyc } = req.body;
            const customerData = JSON.parse(customer);
            const kycData = JSON.parse(kyc);
            const { proof_of_address, doc_verification, cac_certificate } = req.files;
            let bvnInfo
            let bvnData

            // Parse and validate customer data
            const customerValidation = customerDataValidators.validate(customerData);
            if (customerValidation.error) {
                return errorResponse(res, 400, customerValidation.error.details[0].message)
            }
            // Attach files to KYC data
            if (proof_of_address) kycData.proof_of_address = proof_of_address[0].path;
            if (doc_verification) kycData.doc = doc_verification[0].path;
            if (cac_certificate) kycData.cac_certificate = cac_certificate[0].path;

            if (customerData.accountType === 'individual') {
                const existBVNKYC = await KYC.findOne({ "bank_verification_number.bvn": kycData.bvn })
                if (existBVNKYC){
                    return errorResponse(res, 400, "The provided bvn has been used");
                }
                //remove employee size
                delete kycData.employee_size;
            }            

            const kycValidation = kycDataValidators.validate(kycData, { context: { accountType: customerData.accountType } });
  
            if (kycValidation.error) {
                return errorResponse(res, 400, kycValidation.error.details[0].message)
            }

            // Create user and KYC data
            const user_exist = await UserService.getUserByPhone(customerData.phone_number)
            if (user_exist) {
                return errorResponse(res, 409, "User with this phone number already exists");
            }
            const result = await AdminService.createUserCustomer(customerData, kycData);
            if (!result.success) {
                return errorResponse(res, 500, result.message)
            }
            return successResponse(res, 201, result.message, result.user)
        } catch (error) {
            console.error("Error in createCustomer controller: ", error);
            return errorResponse(res, 500, result.message)
        }
    }

    static async getUser(req, res){
        const { userId } = req.params;
        if(!userId){
            return errorResponse(res, 400, "Missing user id")
        }
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return errorResponse(res, 400, "Invalid user ID format or missing user ID");
            }
            const response = await UserService.getUserByID(userId);
            return successResponse(res, 200, "Users returned successfully", response);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }

    static async verifyBVN(req, res){
        const { bvn } = req.body;
        try{
            if(!bvn){
                return errorResponse(res, 400, "Please provide a bvn to proceed to verification")
            }
            const response = await verifyBVN(bvn)
            return successResponse(res, 200, "BVN verified successfully", response.data)
        }catch(error){
            console.error("Error verifying bvn: ", error)
            if(error.statusCode){
                return errorResponse(res, error.statusCode, error.message || "BVN verification failed")
            }
            return errorResponse(res, 500, "Server Error");
        }
    }

    static async generateIndividualCreditReport(req, res) {
        const { consumer_name, dob, bvn, enquiry_reason, report_type } = req.body;
        const { userId } = req.params;
        try {
            let credit_report_url;
            const consumerDetails = {
                ConsumerName: consumer_name,
                DateOfBirth: dob,
                Identification: bvn,
                EnquiryReason: enquiry_reason,
                Accountno: "",
                ProductID: "45"
            };
    
            const matches = await creditReport.matchConsumer(consumerDetails);
    
            if (!matches.length) {
                return errorResponse(res, 400, "No matching consumer found");
            }
    
            const reportDetails = {
                EnquiryID: matches[0].EnquiryID,
                ConsumerID: matches[0].ConsumerID,
                SubscriberEnquiryEngineID: matches[0].MatchingEngineID
            };
            if (report_type === "pdf") {
                const pdfReport = await creditReport.generateConsumerReportPDF(reportDetails);            
                const pdfBuffer = Buffer.from(pdfReport.data, 'base64');
                const pdfFileName = `CW_CREDIT-REPORT-${Date.now()}`;
                const result = await uploadToCloudinary(pdfBuffer, pdfFileName);
                credit_report_url = result.url;

                const response = await CreditReportService.saveCreditReport(userId, [], credit_report_url)
                if(!response.success){
                    return errorResponse(res, 500, response.message)
                }
            
                return successResponse(
                    res,
                    200,
                    "Credit report generated successfully",
                    response.creditReport
                );
            }else{
                const report = await creditReport.generateConsumerReport(reportDetails);
                const reportData = report.data;

                const response = await CreditReportService.saveCreditReport(userId, reportData, "")
                if(!response.success){
                    return errorResponse(res, 500, response.message)
                }
                return successResponse(res, 200, "Credit report generated successfully", response.creditReport);
            }
        } catch (error) {
            console.error("Error fetching individual credit report:", error.message);
            return errorResponse(res, 500, error.message);
        }
    }   
    

    static async generateBusinessCreditReport(req, res){
        const { business_name, registration_number, enquiry_reason, report_type } = req.body;
        const { userId } = req.params;

        try {
            const commercialDetails = {
                BusinessName: business_name,
                BusinessRegistrationNumber: registration_number,
                EnquiryReason: enquiry_reason,
                ProductID: "47"
            };
            let credit_report_url;

            const matches = await creditReport.matchCommercial(commercialDetails);
            if (!matches || matches.length === 0) {
                return errorResponse(res, 404, "No matching business found");
            }            

            if (!matches.length) {
                return errorResponse(res, 404, "No matching business found")
            }
            const reportDetails = {
                EnquiryID: matches[0].SubscriberEnquiryID,
                commercialID: matches[0].CommercialID,
                SubscriberEnquiryEngineID: matches[0].MatchingEngineID
            };
            if (report_type === "pdf"){
                const pdfReport = await creditReport.generateBusinessReportPDF(reportDetails);            
                const pdfBuffer = Buffer.from(pdfReport.data, 'base64');
                const pdfFileName = `CW_CREDIT-REPORT-${Date.now()}`;
                const result = await uploadToCloudinary(pdfBuffer, pdfFileName);
                credit_report_url = result.url;
                const response = await CreditReportService.saveCreditReport(userId, [], credit_report_url)

                if(!response.success){
                    return errorResponse(res, 500, response.message)
                }
                return successResponse(
                    res,
                    200,
                    "Credit report generated successfully",
                    response.creditReport
                );
            }else{
                const report = await creditReport.generateBusinessReport(reportDetails);
                const reportData = report.data;
    
                const response = await CreditReportService.saveCreditReport(userId, reportData, "")

                if(!response.success){
                    return errorResponse(res, 500, response.message)
                }
                return successResponse(res, 200, "Credit report generated successfully", response.creditReport);
            }
        } catch (error) {
            console.error("Error fetching business credit report:", error.message);
            return errorResponse(res, 500, error.message);
        }
    }

    static async fetchCreditReports(req, res) {
        try {
            const { customerId } = req.params;

            if (!customerId) {
                return errorResponse(res, 400, "Customer ID is required");
            }

            const response = await CreditReportService.getCreditReportsByCustomer(customerId);

            if (!response.success) {
                return errorResponse(res, 500, response.message) 
            }
            return successResponse(res, 200, "Credit report fetched successfully", response.creditReports)
        } catch (error) {
            console.error("Error fetching credit reports:", error.message);
            return errorResponse(res, 500, "Server error")
        }
    }
    static async getSingleRole(req, res) {
        try {
            const role = await AdminService.getRoleById(req.params.id);
            if (!role) {
                return errorResponse(res, 404, "No role found");
            }
            return successResponse(res, 200, "Role fetched successfully", role);
        } catch (error) {
            console.error("Error fetching role:", error);
            return errorResponse(res, 500, "Server error while fetching role");
        }
    }

    static async getStaffWithPerm(req, res) {
        const { permission } = req.params;
        try {
          const response = await AdminService.getStaffWithPerm(permission);
          if (response.success) {
            return successResponse(res, 200, response.message, response.staff)
          } else {
            return errorResponse(res, 404, response.message)
          }
        } catch (error) {
          console.error("Error in getStaffWithPerm controller:", error);
          return successResponse(res, 500, "Internal server error")
        }
    }


    static async getTotalActiveLoans(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getActiveLoansCount(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Active loans fetched successfully", result.data);
    }


    static async getTotalDelinquentLoans(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getDelinquentLoansCounts(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Delinquent loans fetched successfully", result.data);
    }


    static async getTotalLoansReadyToDisburse(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getLoansReadyToDisburseCount(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Loans ready to disburse fetched successfully", result.data);
    }


    static async getTotalLoanAmount(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getTotalLoanAmount(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Total loan amount fetched successfully", result.data);
    }

    static async getTotalBusinessLoansAmount(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getTotalBusinessLoansAmount(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Total business loans fetched successfully", result.data);
    }

    static async getTotalIndividualLoansAmount(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getTotalIndividualLoansAmount(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Total individual loans fetched successfully", result.data);
    }

    static async getTotalFullyPaidLoans(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getTotalFullyPaidLoans(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Total fully paid loans fetched successfully", result.data);
    }

    static async getTotalRepaidAmount(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getTotalRepaidAmount(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Total repaid amount fetched successfully", result.data);
    }

    static async getLoanProductDistribution(req, res) {
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
        const result = await AdminService.getLoanProductDistribution(dateFilter);
        if (!result.success) {
            return errorResponse(res, 500, result.message);
        }
        return successResponse(res, 200, "Loan product distribution fetched successfully", result.data);
    }

    //deliqunt graph
    // static async getAllLoanData(req, res) {
    //     const { startDate, endDate } = req.query;
    //     const dateFilter = startDate && endDate ? { start: startDate, end: endDate } : null;
    
    //     const result = await AdminService.getAllLoanStats(dateFilter);
    //     if (!result.success) {
    //         return errorResponse(res, 500, result.message);
    //     }
    //     return successResponse(res, 200, "Loan metrics fetched successfully", result.data);
    // }

    static async getAllLoanData(req, res) {
        try {
            const { timeRange } = req.query;
    
            let dateFilter = null;
    
            if (timeRange === "today") {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);
                dateFilter = { start: startOfDay, end: endOfDay };
            } else if (timeRange === "currentWeek") {
                const today = new Date();
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const endOfWeek = new Date(today.setDate(today.getDate() + (7 - today.getDay())));
                dateFilter = { start: startOfWeek, end: endOfWeek };
            } else if (timeRange === "currentMonth") {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                dateFilter = { start: startOfMonth, end: endOfMonth };
            } else if (timeRange === "currentYear") {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                const endOfYear = new Date(today.getFullYear(), 11, 31);
                dateFilter = { start: startOfYear, end: endOfYear };
            } else if (timeRange === "allTime") {
                dateFilter = {};
            }
    
            //use no filter if timeRange is invalid or not provided
            if (!dateFilter) {
                dateFilter = {};
            }
    
            const result = await AdminService.getAllLoanStats(dateFilter);
    
            if (!result.success) {
                return errorResponse(res, 500, result.message);
            }
    
            return successResponse(res, 200, "Loan metrics fetched successfully", result.data);
        } catch (error) {
            console.error("Error fetching loan metrics:", error);
            return errorResponse(res, 500, "Server error");
        }
    }
}   