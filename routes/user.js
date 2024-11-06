const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/create-user", UserController.createUser);
router.post("/validate-otp/:userId", UserController.validateOTP);

module.exports = router;