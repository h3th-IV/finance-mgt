const express = require('express');
const router = express.Router();
const GuarantorsDataController = require('../controllers/guarantorsDataController');
const parser = require("../config/uploader");
const { verifyToken } = require('../middleware/tokenGenerator');


router.post('/create', parser.fields([
    { name: "file", maxCount: 1 }]), GuarantorsDataController.createGuarantor);
router.get('/guarantor/:id', verifyToken, GuarantorsDataController.getGuarantor);
router.put('/guarantor/:id', verifyToken, GuarantorsDataController.updateGuarantor);
router.delete('/guarantor/:id', verifyToken, GuarantorsDataController.deleteGuarantor);

module.exports = router;
