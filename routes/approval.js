const express = require("express");
const router = express.Router();
const LoanApprovalController = require("../controllers/loanApprovalController");

router.get(
  "/:loanApplicationId/approvals",
  LoanApprovalController.fetchApprovalsForLoanApplication
);
router.get("/approvals", LoanApprovalController.fetchAllApprovals);
router.get(
  "/approvals/:assigneeId",
  LoanApprovalController.fetchApprovalsByAssignee
);
router.post(
  "/request/:approvalId",
  LoanApprovalController.requestApproval
);
router.post(
  "/decline/:approvalId",
  LoanApprovalController.declineApproval
);
router.post(
  "/approve/:approvalId",
  LoanApprovalController.approveApproval
);

module.exports = router;