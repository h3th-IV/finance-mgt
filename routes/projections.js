const express = require("express");
const router = express.Router();
const LoanProjectionController = require("../controllers/loanProjectionController");

router.post("/", LoanProjectionController.createLoanProjection);
router.get("/", LoanProjectionController.getAllLoanProjections);
//router.get("/:loan_package/:year", LoanProjectionController.get);
router.delete("/:loan_package/:year", LoanProjectionController.getLoanProjectionByYearAndPackage);

module.exports = router;
