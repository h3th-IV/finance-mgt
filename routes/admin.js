const express = require("express");
const router = express.Router();
const AdminController = require('../controllers/adminController');
const LoanApplicationController =require('../controllers/loanApplicationController');
const UserController = require("../controllers/userController");    
const { verifyToken } = require("../middleware/tokenGenerator");
const { verifyStaffToken, checkPermission } = require("../middleware/permission");
const parser = require("../config/uploader");

router.get("/all", verifyStaffToken, UserController.getAllUsers);
router.post("/createRole", verifyStaffToken, checkPermission("CREATE_ROLE"), AdminController.createRolePermission);
router.get("/get-kycs", verifyStaffToken, AdminController.getAllkycs);
router.post("/create-loanproduct/:staffId", verifyStaffToken, checkPermission("CREATE_LOAN_PRODUCT"), AdminController.createLoanProduct);
router.patch("/update-loanapp/:loanApplicationId", verifyStaffToken, checkPermission("UPDATE_LOAN_APP"), LoanApplicationController.updateLoanApplication);
router.get("/loan-apps", verifyStaffToken, checkPermission("VIEW_CREATED_LOAN_APP", "VIEW_LOAN_APP"), LoanApplicationController.getAllLoanApplication);
router.patch("/update-product/:productId", verifyStaffToken, checkPermission("UPDATE_LOAN_PRODUCT"), AdminController.updateLoanProduct);
router.get("/loanProducts",AdminController.getAllLoanProducts);
router.post('/add-staff', verifyStaffToken, checkPermission("CREATE_STAFF"), AdminController.createStaff);
router.get('/permissions', verifyStaffToken, AdminController.getAllPermissions);
router.get('/roles', verifyStaffToken, AdminController.getAllRoles);
router.get('/staffs', verifyStaffToken, AdminController.getAllStaffs);
router.patch('/verify', AdminController.updatePassword);
router.post('/login', AdminController.login);
router.get('/bvnData', verifyStaffToken, AdminController.getAllBVNData);
router.delete('/delete/:loanAppId', verifyStaffToken, checkPermission("DELETE_LOAN_APP"), LoanApplicationController.deleteLoanApplication);
router.patch("/archive-loanproduct/:productId", verifyStaffToken, checkPermission("ARCHIVE_LOAN_PRODUCT"), AdminController.archiveLoanProduct);
router.post("/create-loanapp/:customerId", verifyStaffToken, checkPermission("CREATE_LOAN_APP"), parser.fields([
    { name: "statement_of_account", maxCount: 1 },
    { name: "statement_of_networth", maxCount: 1 },
    { name: "security_cheque", maxCount: 1 },
]), LoanApplicationController.createLoanApplication)
router.get('/banks', verifyStaffToken, AdminController.getAllBankDetails);
router.get('/loan-product/:productId', AdminController.getLoanProduct);
router.delete('/del-user/:userId', verifyStaffToken, UserController.deleteUser);
router.post("/create-user", verifyStaffToken, parser.fields([
    { name: 'proof_of_address', maxCount: 1 },
    { name: 'doc_verification', maxCount: 1 },
    { name: 'cac_certificate', maxCount: 1 },
  ]), AdminController.createCustomer
);
router.get("/get-user/:userId", verifyStaffToken, AdminController.getUser);
router.get('/banks/:userId', verifyStaffToken, UserController.getUserBankDetails);
router.get('/loan-summary/:userId', verifyStaffToken, LoanApplicationController.userLoanSummary)
router.get('/loans/:userId', verifyStaffToken, LoanApplicationController.getUserLoans)
router.post('/verify-bvn', verifyStaffToken, AdminController.verifyBVN);
router.post('/credit-report-individual/:userId', verifyStaffToken, AdminController.generateIndividualCreditReport)
router.post('/credit-report-business/:userId', verifyStaffToken, AdminController.generateBusinessCreditReport)
router.get('/credit-report/:customerId', verifyStaffToken, AdminController.fetchCreditReports);

router.get('/role/:id', verifyStaffToken, AdminController.getSingleRole);
router.get('/staff/:permission', verifyStaffToken, AdminController.getStaffWithPerm)


module.exports = router;
