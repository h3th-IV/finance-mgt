const express = require('express');
const router = express.Router();
const LoanApplicationController = require("../controllers/loanApplicationController");
const parser = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');
const { verifyAnyToken } = require('../middleware/permission');

// Handling loan applications, including files for both individuals and businesses
router.post(
    "/loan-application/:customerId",
    verifyToken,
    parser.fields([
        // Common file fields for both individual and business
        { name: "statement_of_account", maxCount: 1 },
        { name: "statement_of_networth", maxCount: 1 },
        { name: "security_cheque", maxCount: 1 },
        
        // Business-specific fields for collateral
        { name: "business_collateral.description_of_assets", maxCount: 1 },
        { name: "business_collateral.valuation_reports", maxCount: 1 },
        { name: "business_collateral.photographs", maxCount: 10 }, 
        { name: "other_documents.business_plan", maxCount: 1 },
        { name: "other_documents.tax_clearance", maxCount: 1 },
        { name: "other_documents.insurance_documents", maxCount: 1 }, 
    ]),
    LoanApplicationController.createLoanApplication
);

// Other routes for loan calculation and fetching a single loan application
router.post('/calc-loan', LoanApplicationController.calculatorLoan);
router.get('/get-single-loan/:identifier', verifyToken, LoanApplicationController.getLoanApplication);
router.get('/user-repayments/:userId', verifyAnyToken, LoanApplicationController.getAllRepaymentsForUser)
router.get('/loan-repayments/:loanApplicationId', verifyAnyToken, LoanApplicationController.getRepaymentsForLoanApplication)
router.get('/repayments',  verifyAnyToken, LoanApplicationController.getAllRepayments)
module.exports = router;
