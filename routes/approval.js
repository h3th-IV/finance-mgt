const express = require("express");
const router = express.Router();
const LoanApprovalController = require("../controllers/loanApprovalController");
const { verifyStaffToken, checkPermission, fetchApprovalAction } = require("../middleware/permission");


router.get("/:loanApplicationId/approvals", LoanApprovalController.fetchApprovalsForLoanApplication);
router.get("/approvals", LoanApprovalController.fetchAllApprovals);
router.get("/approvals/:assigneeId",  verifyStaffToken,LoanApprovalController.fetchApprovalsByAssignee);
router.patch("/request/:approvalId", verifyStaffToken, LoanApprovalController.requestApproval);
router.patch("/decline/:approvalId",  verifyStaffToken, fetchApprovalAction, checkPermission(), LoanApprovalController.declineApproval);
router.patch("/approve/:approvalId",  verifyStaffToken, fetchApprovalAction, checkPermission(), LoanApprovalController.approveApproval);
router.patch("/comment/:approvalId",  verifyStaffToken, LoanApprovalController.requestComment);
module.exports = router;