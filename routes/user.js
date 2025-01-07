const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const parser = require("../config/uploader");
const { verifyToken } = require("../middleware/tokenGenerator");
const LoanApplicationController = require('../controllers/loanApplicationController');

router.post("/signup", UserController.createUser);
router.post("/validate-otp/:userId", UserController.validateOTP);
router.get("/all", UserController.getAllUsers);
router.get("/single/:id", UserController.getAllUser);
router.post("/signin", UserController.login);
router.post("/regenerate-otp/:userId", UserController.regenerateOTP);
router.post("/forgot-password", UserController.forgotPasswordOTP);
router.patch("/reset-password", UserController.resetPassword);
router.patch("/kyc-email/:userId", verifyToken, UserController.kycEmailOTPValidation);
router.post("/regen-otp/:userId", verifyToken, UserController.kycRegenEmailOTP);
router.patch("/kyc/:userId", verifyToken, parser.fields([
    { name: 'utility_bill.doc', maxCount: 1 }, 
    { name: 'document_verification.doc', maxCount: 1 },
    { name: 'address.proof_of_address', maxCount: 1 } 
  ]),  UserController.updateKYC);
router.post("/bvn-otp/:userId", verifyToken, UserController.bvnOTPValidation);
router.patch("/regen-bvn-otp/:userId", verifyToken, UserController.bvnOTPRegen);
router.get("/loans/:userId", verifyToken, LoanApplicationController.getUserLoanApplications);
router.post('/add-bank/:userId', verifyToken, UserController.addUserBankDetails);
router.get('/bank/:bankId', verifyToken, UserController.getBankDetailsById);
router.get('/banks/:userId', verifyToken, UserController.getUserBankDetails)
router.patch('/bank/:bankId', verifyToken, UserController.archiveBankAccount);
router.patch('/update-otp/:userId', verifyToken, UserController.sendPasswordUpdateOTP)
router.patch('/update-password/:userId', verifyToken, UserController.updatePassword);
module.exports = router;