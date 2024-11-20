const express = require("express");
const router = express.Router();
const AdminController = require('../controllers/adminController');
const LoanApplicationController =require('../controllers/loanApplicationController');
const { verifyToken } = require("../middleware/tokenGenerator");

router.get("/get-kycs", AdminController.getAllkycs);
router.post("/create-loanproduct/:userId", verifyToken, AdminController.createLoanProduct);
router.patch("/update-loanapp/:loanApplicationId", verifyToken, LoanApplicationController.updateLoanApplication);
router.get("/get-loanApps", verifyToken, LoanApplicationController.getAllLoanApplication);


module.exports = router;
