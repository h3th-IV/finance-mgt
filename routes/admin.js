const express = require("express");
const router = express.Router();
const AdminController = require('../controllers/adminController');
const LoanApplicationController =require('../controllers/loanApplicationController');
const { verifyToken } = require("../middleware/tokenGenerator");

router.post("/createRole", verifyToken, AdminController.createRolePermission);
router.get("/get-kycs", AdminController.getAllkycs);
router.post("/create-loanproduct/:userId", verifyToken, AdminController.createLoanProduct);
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



module.exports = router;
