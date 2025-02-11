const express = require('express');
const router = express.Router();
const GuarantorsDataController = require('../controllers/guarantorsDataController');
const parser = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');
const { verifyAnyToken } = require('../middleware/permission');


router.post('/create/:loanApplicationId', verifyAnyToken, parser.fields([
    { name: "file", maxCount: 1 }]), GuarantorsDataController.createGuarantor);
router.get('/guarantor/:id', verifyAnyToken, GuarantorsDataController.getGuarantor);
router.put('/guarantor/:id', verifyAnyToken, GuarantorsDataController.updateGuarantor);
router.delete('/guarantor/:id', verifyAnyToken, GuarantorsDataController.deleteGuarantor);

module.exports = router;
