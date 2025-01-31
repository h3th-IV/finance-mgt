const express = require("express");
const router = express.Router();
const LoanApprovalController = require("../controllers/loanApprovalController");
const { verifyStaffToken, checkPermission, fetchApprovalAction } = require("../middleware/permission");


router.get("/:loanApplicationId/approvals", LoanApprovalController.fetchApprovalsForLoanApplication);
router.get("/approvals", LoanApprovalController.fetchAllApprovals);
router.get("/approvals/:assigneeId",  verifyStaffToken,LoanApprovalController.fetchApprovalsByAssignee);
router.post("/request/:approvalId", verifyStaffToken, LoanApprovalController.requestApproval);
router.post("/decline/:approvalId",  verifyStaffToken, fetchApprovalAction, checkPermission(), LoanApprovalController.declineApproval);
router.post("/approve/:approvalId",  verifyStaffToken, fetchApprovalAction, checkPermission(), LoanApprovalController.approveApproval);
module.exports = router;