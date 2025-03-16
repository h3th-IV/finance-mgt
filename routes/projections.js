const express = require('express');
const router = express.Router();
const LoanProjectionController = require('../controllers/loanProjectionController');


router.post('/', LoanProjectionController.createLoanProjection);
router.get('/', LoanProjectionController.getAllLoanProjections);
router.get('/:year', LoanProjectionController.getLoanProjectionByYear);
router.put('/:year', LoanProjectionController.updateLoanProjectionByYear);
router.delete('/:year', LoanProjectionController.deleteLoanProjectionByYear);

module.exports = router;
