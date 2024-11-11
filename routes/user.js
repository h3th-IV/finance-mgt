const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/signup", UserController.createUser);
router.post("/validate-otp/:userId", UserController.validateOTP);
router.get("/all", UserController.getAllUsers);
router.post("/signin", UserController.login);
router.post("/regenerate-otp/:userId", UserController.regenerateOTP);
module.exports = router;