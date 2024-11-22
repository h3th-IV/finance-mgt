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
router.patch("/kyc/:userId", verifyToken, parser.fields([
    { name: 'facial_verification.pic', maxCount: 1 }, 
    { name: 'document_verification.doc', maxCount: 1 }
  ]),  UserController.updateKYC);
router.get("/loans/:userId", verifyToken, LoanApplicationController.getUserLoanApplications);


module.exports = router;