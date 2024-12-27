const express = require('express');
const router = express.Router();
const LoanApplicationController = require("../controllers/loanApplicationController");
const parser = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');


router.post(
    "/loan-application/:customerId",
    verifyToken,
    parser.fields([
        { name: "statement_of_account", maxCount: 1 },
        { name: "statement_of_networth", maxCount: 1 },
        { name: "security_cheque", maxCount: 1 },
    ]),
    LoanApplicationController.createLoanApplication);
router.post('/calc-loan', LoanApplicationController.calculatorLoan);

module.exports = router;