const express = require('express');
const router = express.Router();
const LoanApplicationController = require("../controllers/loanApplicationController");
const parser = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');


router.post(
    "/loan-application/:userId",
    verifyToken,
    parser.fields([
        { name: "statement_of_account", maxCount: 1 },
        { name: "guarantor.kyc_guarantor_form", maxCount: 1 },
        { name: "guarantor.passport_form", maxCount: 1 },
        { name: "guarantor.statement_of_net_worth", maxCount: 1 },
        { name: "guarantor.security_cheque", maxCount: 1 },
    ]),
    LoanApplicationController.createLoanApplication);

module.exports = router;