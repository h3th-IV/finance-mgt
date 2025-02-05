const LoanApplication = require("../models/loanApplication");
const LoanApproval = require("../models/loanApproval");

module.exports = class ApprovalService {
  static async createApprovals(loanApplicationId) {
    try {
      const approvals = [];

      //define approval levels, actions, and titles
      const approvalLevels = [
        { level: 1, action: "Credit Check", title: "Credit Check" },
        { level: 2, action: "Internal Control", title: "Internal Control" },
        { level: 3, action: "Approve Borrowers Credit", title: "Approve Borrowers Credit" },
        { level: 4, action: "Loan Disbursement", title: "Loan Disbursement" },
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

  static async approveApproval(approvalId, approvalNote, staffId) {
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
      
      if (approval.assignee.toString() !== staffId) {
        return {
          success: false,
          message: "You are not authorized to approve this approval.",
          code: "UNAUTHORIZED",
        };
      }
  
      approval.status = "Approved";
      approval.approvalNote = approvalNote || "";
  
      const updatedApproval = await approval.save();
  
      //update the loan appli status (ignore err for non-last approvals)
      const loanApplicationUpdateResult = await this.updateLoanApplicationStatus(approval.loanApplication);
  
      //only return loan app update result if it's a success
      if (loanApplicationUpdateResult.success) {
        return {
          success: true,
          message: "Approval approved successfully, Loan Application is ready for disbursement",
          approval: updatedApproval,
          loanApplication: loanApplicationUpdateResult.loanApplication,
        };
      }
  
      //if loan app status update failed (e.g., last approval not completed), still return success for the approval
      return {
        success: true,
        message: "Approval approved successfully. Loan application status not updated (last approval not completed).",
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

  static async declineApproval(approvalId, declineNote, staffId) {
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

      if (approval.assignee.toString() !== staffId) {
        return {
          success: false,
          message: "You are not authorized to decline this approval.",
          code: "UNAUTHORIZED",
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
  
      //update the loan application status (ignore err for not last approvals)
      const loanApplicationUpdateResult = await this.updateLoanApplicationStatus(approval.loanApplication);
  
      //only return the loan application update result if it's a success
      if (loanApplicationUpdateResult.success) {
        return {
          success: true,
          message: "Approval declined successfully. Loan Application has been declined",
          approval: updatedApproval,
          loanApplication: loanApplicationUpdateResult.loanApplication,
        };
      }
  
      //if the loan application status update failed (e.g., last approval not completed), still return success
      return {
        success: true,
        message: "Approval declined successfully. Loan application status not updated (last approval not completed).",
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


  static async updateLoanApplicationStatus(loanApplicationId) {
    try {
      const approvals = await LoanApproval.find({ loanApplication: loanApplicationId })
        .sort({ approvalLevel: -1 }) //descending order
        .limit(1); //get the last approval level
  
      if (!approvals || approvals.length === 0) { 
        return {
          success: false,
          message: "No approvals found for this loan application.",
          code: "NOT_FOUND",
        };
      }
  
      const lastApproval = approvals[0]; //get the last approval
  
      const loanApplication = await LoanApplication.findById(loanApplicationId);
      if (!loanApplication) {
        return {
          success: false,
          message: "Loan application not found.",
          code: "NOT_FOUND",
        };
      }
  
      if (lastApproval.status === "Approved") {
        loanApplication.status = "ready_for_disbursement";
      } else if (lastApproval.status === "Declined") {
        loanApplication.status = "declined";
      } else {
        return {
          success: false,
          message: "The last approval level is not yet completed.",
          code: "INVALID_STATUS",
        };
      }
  
      //save the updated loan app
      const updatedLoanApplication = await loanApplication.save();
  
      return {
        success: true,
        message: "Loan application status updated successfully.",
        loanApplication: updatedLoanApplication,
      };
    } catch (error) {
      console.error("Error updating loan application status:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }
  }
};
