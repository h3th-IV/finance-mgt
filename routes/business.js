const express = require('express');
const router = express.Router();
const BusinessControllers = require("../controllers/businessControllers");
const parser = require("../config/uploader");
const { verifyToken } = require("../middleware/tokenGenerator");

router.patch("/bus-kyc/:businessId", verifyToken, parser.fields([
    { name: 'business_registration.certificate', maxCount: 1 },
    { name: 'business_address.proof_of_address', maxCount: 1 }
  ]),  BusinessControllers.businessUpdateKYC);

  module.exports = router;