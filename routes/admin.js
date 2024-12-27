const express = require("express");
const router = express.Router();
const AdminController = require('../controllers/adminController');
const LoanApplicationController =require('../controllers/loanApplicationController');
const { verifyToken } = require("../middleware/tokenGenerator");
const { verifyStaffToken, checkPermission } = require("../middleware/permission");
const parser = require("../config/uploader");

router.post("/createRole", verifyToken, AdminController.createRolePermission);
router.get("/get-kycs", AdminController.getAllkycs);
router.post("/create-loanproduct/:staffId", verifyToken, AdminController.createLoanProduct);
router.patch("/update-loanapp/:loanApplicationId", verifyToken, LoanApplicationController.updateLoanApplication);
router.get("/loan-apps", verifyToken, LoanApplicationController.getAllLoanApplication);
router.patch("/update-product/:productId", verifyToken, AdminController.updateLoanProduct);
router.get("/loanProducts", AdminController.getAllLoanProducts);
router.post('/add-staff', verifyToken, AdminController.createStaff);
router.get('/permissions', verifyToken, AdminController.getAllPermissions);
router.get('/roles', verifyToken, AdminController.getAllRoles);
router.get('/staffs', verifyToken, AdminController.getAllStaffs);
router.patch('/verify', AdminController.updatePassword);
router.post('/login', AdminController.login);
router.get('/bvnData', verifyToken, AdminController.getAllBVNData);
router.delete('/delete/:loanAppId', verifyToken, LoanApplicationController.deleteLoanApplication);
router.patch("/archive-loanproduct/:productId", verifyToken, AdminController.archiveLoanProduct);
router.post("/create-loanapp/:customerId", verifyStaffToken, checkPermission("CREATE_LOAN_APP"), parser.fields([
    { name: "statement_of_account", maxCount: 1 },
    { name: "statement_of_networth", maxCount: 1 },
    { name: "security_cheque", maxCount: 1 },
]), LoanApplicationController.createLoanApplication)



module.exports = router;
