const express = require('express');
const router = express.Router();
const LoanApplicationController = require("../controllers/loanApplicationController");
const {parser, uploadImageMiddleware} = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');
const { verifyAnyToken } = require('../middleware/permission');
const { verifyStaffToken, checkPermission } = require("../middleware/permission");


// Handling loan applications, including files for both individuals and businesses
router.post(
    "/loan-application/:customerId",
    verifyToken,
    parser.fields([
        // Common file fields for both individual and business
        { name: "statement_of_account", maxCount: 1 },
        { name: "statement_of_networth", maxCount: 1 },
        { name: "security_cheque", maxCount: 1 },
        { name: "business_collateral.description_of_assets", maxCount: 1 },
        { name: "business_collateral.valuation_reports", maxCount: 1 },
        { name: "business_collateral.photographs", maxCount: 10 }, 
        { name: "other_documents.business_plan", maxCount: 1 },
        { name: "other_documents.tax_clearance", maxCount: 1 },
        { name: "other_documents.insurance_documents", maxCount: 1 }, 
    ]),uploadImageMiddleware,
    LoanApplicationController.createLoanApplication
);

// Other routes for loan calculation and fetching a single loan application
router.post('/calc-loan', LoanApplicationController.calculatorLoan);
router.get('/get-single-loan/:identifier', verifyToken, LoanApplicationController.getLoanApplication);
router.get('/user-repayments/:userId', verifyAnyToken, LoanApplicationController.getAllRepaymentsForUser)
router.get('/loan-repayments/:loanApplicationId', verifyAnyToken, LoanApplicationController.getRepaymentsForLoanApplication)
router.get('/repayments',  verifyAnyToken, LoanApplicationController.getAllRepayments)
router.patch("/:id/disburse", verifyStaffToken, checkPermission("DISBURSE_LOAN_APP"), LoanApplicationController.disburseLoan);

router.patch(
    "/:identifier/upload-document",
    verifyAnyToken,
    parser.fields([
        { name: "additional_document", maxCount: 1 } // multer middleware to handle the file upload
    ]),
    uploadImageMiddleware,
    LoanApplicationController.uploadAdditionalDocument
);

router.patch(
    "/:identifier/upload-offer-letter",
    verifyAnyToken,
    parser.single("offer_letter"),
    LoanApplicationController.uploadOfferLetter
);

router.get("/loan-cards/:userId", verifyToken, LoanApplicationController.getUserLoansCard);

//repayLoan
router.post("/:loanApplicationId/repay", verifyAnyToken, LoanApplicationController.logRepayment);

module.exports = router;
