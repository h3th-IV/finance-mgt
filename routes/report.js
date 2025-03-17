const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/loan-report", reportController.generateLoanReport);
// router.get("/loan-metrics-by-product", reportController.generateLoanMetricsByProduct);
// router.get("/relationship-officer", reportController.getRelationshipOfficerReport);

module.exports = router;
