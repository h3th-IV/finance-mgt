const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const parser = require("../config/uploader");

router.post("/signup", UserController.createUser);
router.post("/validate-otp/:userId", UserController.validateOTP);
router.get("/all", UserController.getAllUsers);
router.post("/signin", UserController.login);
router.post("/regenerate-otp/:userId", UserController.regenerateOTP);
router.post("/forgot-password", UserController.forgotPasswordOTP);
router.patch("/reset-password", UserController.resetPassword);
router.patch("/kyc/:userId",parser.fields([
    { name: 'facial_verification', maxCount: 1 }, 
    { name: 'document_verification.doc', maxCount: 1 }
  ]),  UserController.updateKYC);


module.exports = router;