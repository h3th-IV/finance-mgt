const LoanApproval = require("../models/loanApproval");

module.exports = class ApprovalService {
  static async createApprovals(loanApplicationId) {
    try {
      const approvals = [];

      //define approval levels, actions, and titles
      const approvalLevels = [
        { level: 1, action: "action-1", title: "title-1" },
        { level: 2, action: "action-2", title: "title-2" },
        { level: 3, action: "action-3", title: "title-3" },
        { level: 4, action: "action-4", title: "title-4" },
        { level: 5, action: "action-5", title: "title-5" },
      ];

      for (const { level, action, title } of approvalLevels) {
        const approval = new LoanApproval({
          approvalLevel: level,
          approvalAction: action,
          approvalTitle: title,
          loanApplication: loanApplicationId,
          status: "New",
        });

        const savedApproval = await approval.save();
        approvals.push(savedApproval);
      }
      return approvals;
    } catch (error) {
      console.error("Error creating approvals:", error);
      throw new Error(`Failed to create approvals: ${error.message}`);
    }
  }


  static async fetchApprovalsForLoanApplication(loanApplicationId) {
    try {
      const approvals = await LoanApproval.find({ loanApplication: loanApplicationId })
        .populate("assignee", "first_name email")

      if (!approvals || approvals.length === 0) {
        return {
          success: false,
          message: "No approvals found for this loan application.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "All approvals fetched successfully",
        approvals,
      };
    } catch (error) {
      console.error("Error fetching approvals for loan application:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async fetchAllApprovals() {
    try {
      const approvals = await LoanApproval.find()
        .populate("assignee", "first_name email")

      if (!approvals || approvals.length === 0) {
        return {
          success: false,
          message: "No approvals found in the database.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "All approvals fetched successfully",
        approvals,
      };
    } catch (error) {
      console.error("Error fetching all approvals:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async fetchApprovalsByAssignee(assigneeId) {
    try {
      const approvals = await LoanApproval.find({ assignee: assigneeId })
        .populate("assignee", "name email")

      if (!approvals || approvals.length === 0) {
        return {
          success: false,
          message: "No approvals found for this assignee.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Approvals fetched successfully for the assignee",
        approvals,
      };
    } catch (error) {
      console.error("Error fetching approvals by assignee:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async requestApproval(approvalId, assigneeId, requestNote) {
    try {
      const approval = await LoanApproval.findById(approvalId);
      if (!approval) {
        return {
          success: false,
          message: "Approval not found.",
          code: "NOT_FOUND",
        };
      }

      if (approval.status !== "New") {
        return {
          success: false,
          message: `Approval is already ${approval.status.toLowerCase()}.`,
          code: "INVALID_STATUS",
        };
      }

      approval.status = "Requested";
      approval.assignee = assigneeId;
      approval.requestNote = requestNote;

      const updatedApproval = await approval.save();

      return {
        success: true,
        message: "Approval requested successfully.",
        approval: updatedApproval,
      };
    } catch (error) {
      console.error("Error requesting approval:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async approveApproval(approvalId, approvalNote) {
    try {
      const approval = await LoanApproval.findById(approvalId);
      if (!approval) {
        return {
          success: false,
          message: "Approval not found.",
          code: "NOT_FOUND",
        };
      }

      if (approval.status !== "Requested") {
        return {
          success: false,
          message: `Approval cannot be approved because it is ${approval.status.toLowerCase()}.`,
          code: "INVALID_STATUS",
        };
      }

      approval.status = "Approved";
      approval.approvalNote = approvalNote || "";

      const updatedApproval = await approval.save();

      return {
        success: true,
        message: "Approval approved successfully.",
        approval: updatedApproval,
      };
    } catch (error) {
      console.error("Error approving approval:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }

  static async declineApproval(approvalId, declineNote) {
    try {
      const approval = await LoanApproval.findById(approvalId);
      if (!approval) {
        return {
          success: false,
          message: "Approval not found.",
          code: "NOT_FOUND",
        };
      }

      if (approval.status !== "Requested") {
        return {
          success: false,
          message: `Approval cannot be declined because it is ${approval.status.toLowerCase()}.`,
          code: "INVALID_STATUS",
        };
      }

      if (!declineNote || declineNote.trim() === "") {
        return {
          success: false,
          message: "A decline note is required.",
          code: "MISSING_DECLINE_NOTE",
        };
      }

      approval.status = "Declined";
      approval.declineNote = declineNote;

      const updatedApproval = await approval.save();

      return {
        success: true,
        message: "Approval declined successfully.",
        approval: updatedApproval,
      };
    } catch (error) {
      console.error("Error declining approval:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }
};
