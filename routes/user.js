const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/signup", UserController.createUser);
router.post("/validate-otp/:userId", UserController.validateOTP);
router.get("/all", UserController.getAllUsers);
router.post("/signin", UserController.login);
router.post("/regenerate-otp/:userId", UserController.regenerateOTP);
router.post("/forgot-password", UserController.forgotPasswordOTP);
router.patch("/reset-password", UserController.resetPassword);
module.exports = router;