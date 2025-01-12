const express = require('express');
const router = express.Router();
const BusinessControllers = require("../controllers/businessControllers");
const parser = require("../config/uploader");
const { verifyToken, Business } = require("../middleware/tokenGenerator");

router.patch("/kyc/:businessId", verifyToken, Business, parser.fields([
    { name: 'business_registration.certificate', maxCount: 1 },
    { name: 'business_address.proof_of_address', maxCount: 1 },
    { name: 'cac_certificate', maxCount: 1 }
  ]),  BusinessControllers.businessUpdateKYC);
router.get("/test", verifyToken, Business, BusinessControllers.businessTest)
router.post("/kyc-email/:businessId", verifyToken, Business, BusinessControllers.businessKYCEmailOTPValidation);
router.post("/re-kyc-email/:businessId", verifyToken, Business, BusinessControllers.businessKYCRegenEmailOTP);

module.exports = router;