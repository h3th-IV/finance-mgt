const express = require("express");
const router = express.Router();
const AdminController = require('../controllers/adminController');

router.get("/get-kycs", AdminController.getAllkycs);

module.exports = router;