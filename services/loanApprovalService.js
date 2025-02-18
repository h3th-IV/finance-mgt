const LoanApplication = require("../models/loanApplication");
const LoanApproval = require("../models/loanApproval");
const Staff = require("../models/staff");
const ActivityLogService = require("./activityLogService");
const mailer = require("../config/mailer");

module.exports = class ApprovalService {
  static async createApprovals(loanApplicationId) {
    try {
      const approvals = [];

      //define approval levels, actions, and titles
      const approvalLevels = [
        {
          level: 1,
          action: "Credit Check",
          title: "Relationship Manager",
          description: "Responsible for initiating and managing client relationships throughout the loan process."
        },
        {
          level: 2,
          action: "Internal Control",
          title: "Accounts Dept",
          description: "Ensures internal controls, auditing, and compliance during financial transactions and loan disbursements."
        },
        {
          level: 3,
          action: "Loan Disbursement",
          title: "Management Approval",
          description: "Requires final approval from management for loan decisions or special conditions."
        }
      ];

      for (const { level, action, title , description} of approvalLevels) {
        const approval = new LoanApproval({
          approvalLevel: level,
          approvalAction: action,
          approvalTitle: title,
          approvalDescription: description,
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


  static async getApprovalById(approvalId) {
    try {
        const approval = await LoanApproval.findById(approvalId).populate("loanApplication", "loan_id loan_amount status");
        if (!approval) {
          throw new Error("Approval not found");
        }
        return approval
    } catch (error) {
        console.error("Error fetching approval by ID:", error);
        throw new Error(`Failed to get approval: ${error.message}`);
    }
  }


  static async fetchApprovalsForLoanApplication(loanApplicationId) {
    try {
      const approvals = await LoanApproval.find({ loanApplication: loanApplicationId })
        .populate("assignee", "first_name last_name email")
        .populate("requester", "first_name last_name email");

      if (!approvals || approvals.length === 0) {
        throw new Error("No approvals found for this loan application.");
      }
      return approvals;
    } catch (error) {
      console.error("Error fetching approvals for loan application:", error);
      throw error;
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

  static async validatePrecedingLevels(loanApplicationId, currentLevel) {
    try {
      const approvals = await LoanApproval.find({
        loanApplication: loanApplicationId,
        approvalLevel: { $lt: currentLevel },
      }).sort({ approvalLevel: 1 });

      console.log({approvals});
      

      for (const approval of approvals) {
        if (approval.status !== "Approved") {
          return {
            success: false,
            message: `Approval level ${approval.approvalLevel} must be approved before proceeding.`,
            code: "PREVIOUS_LEVEL_NOT_APPROVED",
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error validating preceding levels:", error);
      return {
        success: false,
        message: "An unexpected error occurred while validating preceding levels.",
        code: "SERVER_ERROR",
      };
    }
  }

  static async requestApproval(approvalId, assigneeId, requestNote, staffId) {
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

      // //chek preceding levels
      // const validationResult = await this.validatePrecedingLevels(
      //     approval.loanApplication,
      //     approval.approvalLevel
      // );
      // if (!validationResult.success) {
      //     return validationResult;
      // }

      const assignee = await Staff.findById(assigneeId);
      if (!assignee) {
        return {
            success: false,
            message: "Assignee not found.",
            code: "ASSIGNEE_NOT_FOUND",
        };
      }
      const assigneeName = `${assignee.first_name} ${assignee.last_name}`
      approval.status = "Requested";
      approval.assignee = assigneeId;
      approval.requestNote = requestNote;
      approval.requester = staffId;
      const updatedApproval = await approval.save();

      const req_staff = await Staff.findById(staffId);
      const requester_name = `${req_staff.first_name} ${req_staff.last_name}`;
      await ActivityLogService.LogActivity(
        "update",
        "Staff",
        staffId,
        "LoanApplication",
        approval.loanApplication,
        {
          message: `${requester_name} Requested ${approval.approvalAction} Approval for this Loan Application`,
        }
      )

      await mailer.sendApprovalRequestEmail(assignee.email, assigneeName, requester_name, approval.approvalAction, approval.loanApplication);
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

      const requester = await Staff.findById(approval.requester);
      if(!requester){
        return {
          success: false,
          message: "The Staff that requested this approval was not found.",
          code: "NOT_FOUND",
        };
      }
  
      // Check status before attempting to approve
      if (approval.status !== "Requested") {
        return {
          success: false,
          message: `Approval cannot be approved because it is of status ${approval.status.toLowerCase()}.`,
          code: "INVALID_STATUS",
        };
      }
  
      // Check if the staff member is authorized to approve
      if (approval.assignee.toString() !== staffId) {
        return {
          success: false,
          message: "You are not authorized to approve this approval.",
          code: "UNAUTHORIZED",
        };
      }
  
      // Check preceding levels
      const validationResult = await this.validatePrecedingLevels(
        approval.loanApplication,
        approval.approvalLevel
      );
      if (!validationResult.success) {
        return validationResult;
      }
  
      // Now update the status after all checks
      approval.status = "Approved";
      approval.approvalNote = approvalNote || "";
  
      const updatedApproval = await approval.save();
  
      // Update the loan application status (ignore error for non-last approvals)
      const loanApplicationUpdateResult = await this.updateLoanApplicationStatus(approval.loanApplication);
  
      // Return loan app update result only if it's a success
      if (loanApplicationUpdateResult.success) {
        return {
          success: true,
          message: "Approval approved successfully, Loan Application is ready for disbursement",
          approval: updatedApproval,
          loanApplication: loanApplicationUpdateResult.loanApplication,
        };
      }

      const requesterName = `${requester.first_name} ${requester.last_name}`;
      const approver = await Staff.findById(staffId);
      const approverName = `${approver.first_name} ${approver.last_name}`;
      await ActivityLogService.LogActivity(
        "update",
        "Staff",
        staffId,
        "LoanApplication",
        approval.loanApplication,
        {
          message: `${approverName} Approved ${approval.approvalAction} Approval for this Loan Application`,
        }
      );

      await mailer.sendApprovalApprovedEmail(requester.email, requesterName, approverName, updatedApproval.approvalAction, updatedApproval.loanApplication);
  
      // If loan application status update failed, still return success for the approval
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

      const requester = await Staff.findById(approval.requester);
      if(!requester){
        return {
          success: false,
          message: "The Staff that requested this approval was not found.",
          code: "NOT_FOUND",
        };
      }
  
      if (approval.status !== "Requested") {
        return {
          success: false,
          message: `Approval cannot be declined because it is of status ${approval.status.toLowerCase()}.`,
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
  
      // Validate that a decline note is provided
      if (!declineNote || declineNote.trim() === "") {
        return {
          success: false,
          message: "A decline note is required.",
          code: "MISSING_DECLINE_NOTE",
        };
      }
  
      // Check preceding approval levels
      const validationResult = await this.validatePrecedingLevels(
        approval.loanApplication,
        approval.approvalLevel
      );
      if (!validationResult.success) {
        return validationResult;
      }
  
      // Change the status to "Declined" and save the decline note
      approval.status = "Declined";
      approval.declineNote = declineNote;
  
      const updatedApproval = await approval.save();
  
      // Update the loan application status (ignoring errors if not the last approval)
      const loanApplicationUpdateResult = await this.updateLoanApplicationStatus(approval.loanApplication);
  
      // Only return the loan application update result if it's a success
      if (loanApplicationUpdateResult.success) {
        return {
          success: true,
          message: "Approval declined successfully. Loan Application has been declined.",
          approval: updatedApproval,
          loanApplication: loanApplicationUpdateResult.loanApplication,
        };
      }
  
      // Log the activity if the loan application status update failed (e.g., if it's not the last approval)
      const approver = await Staff.findById(staffId); // Fix staff lookup
      const approverName = `${approver.first_name} ${approver.last_name}`;const requesterName = `${requester.first_name} ${requester.last_name}`;
      await ActivityLogService.LogActivity(
        "update",
        "Staff",
        staffId,
        "LoanApplication",
        approval.loanApplication,
        {
          message: `${approverName} Declined ${approval.approvalAction} Approval for this Loan Application`,
        }
      );
      await mailer.sendApprovalDeclinedEmail(requester.email, requesterName, approverName, updatedApproval.approvalAction, updatedApproval.loanApplication, updatedApproval.declineNote);
  
      // Return success for the approval even if loan application status update failed
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

  static async addComment(approvalId, comment, staffId) {
  try {
    console.log({approvalId, comment, staffId});
    
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
        message: `Approval cannot have comments added because it is of status ${approval.status.toLowerCase()}.`,
        code: "INVALID_STATUS",
      };
    }

    if (approval.assignee.toString() !== staffId) {
      return {
        success: false,
        message: "You are not authorized to add a comment to this approval.",
        code: "UNAUTHORIZED",
      };
    }

    // Add the comment to the additionalNote array (message trail)
    const staff = await Staff.findById(staffId);
    console.log({staff});
    
    const name = `${staff.first_name} ${staff.last_name}`;
    
    approval.additionalNote.push({
      message: comment || "No comment provided.",
      sender: staff,
      timestamp: new Date(),
      noteType: 'Staff'
    });


    console.log({approval});
    const updatedApproval = await approval.save();

    await ActivityLogService.LogActivity(
      "update",
      "Staff",
      staffId,
      "LoanApplication",
      approval.loanApplication,
      {
        message: `${name} added a comment on the approval process for this Loan Application`,
      }
    );

    return {
      success: true,
      message: "Comment added successfully.",
      approval: updatedApproval,
    };
  } catch (error) {
    console.error("Error adding comment to approval:", error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      code: "INTERNAL_ERROR",
    };
  }
}

};
