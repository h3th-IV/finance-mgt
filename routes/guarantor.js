const express = require('express');
const router = express.Router();
const GuarantorsDataController = require('../controllers/guarantorsDataController');
const parser = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');
const { verifyAnyToken } = require('../middleware/permission');


router.post('/create/:loanApplicationId', parser.fields([
    { name: "file", maxCount: 1 }]), GuarantorsDataController.createGuarantor);
router.get('/guarantor/:id', GuarantorsDataController.getGuarantor);
router.put('/guarantor/:id', GuarantorsDataController.updateGuarantor);
router.delete('/guarantor/:id', GuarantorsDataController.deleteGuarantor);
router.get('/guarantors/:id', GuarantorsDataController.getGuarantorsForLoanApplication);
module.exports = router;
