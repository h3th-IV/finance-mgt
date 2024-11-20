const express = require("express");
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { verifyToken } = require("../middleware/tokenGenerator");

router.get("/get-kycs", AdminController.getAllkycs);
router.post("/create-loanproduct/:userId", verifyToken, AdminController.createLoanProduct);

module.exports = router;
