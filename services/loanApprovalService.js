const LoanApplication = require("../models/loanApplication");
const LoanApproval = require("../models/loanApproval");
const Staff = require("../models/staff");
const ActivityLogService = require("./activityLogService");
const mailer = require("../config/mailer");
const AdminService = require('../services/adminService');
const loanApplication = require("../models/loanApplication");
const { generateOfferLetter } = require("./offerLetterService");
const loanProduct = require("../models/loanProduct");

module.exports = class ApprovalService {

  static async addComment(loanApprovalId, comment, commenterId) {
    try {
      const loanApproval = await LoanApproval.findById(loanApprovalId).populate({
        path: 'assignee',
        select: 'first_name email',
      });
      if (!loanApproval) {
        throw new Error("LoanApproval not found");
      }

      const newComment = {
        commentId: loanApproval.comments.length + 1,
        comment,
        commenter: commenterId,
        timestamp: Date.now(),
        replies: []
      };

      loanApproval.comments.push(newComment);
      await loanApproval.save();
      await mailer.sendCommentAddedEmail(loanApproval.assignee.email, loanApproval.assignee.first_name, commenterId.first_name, comment, loanApproval.loanApplication);
      
      //find Relationship Manager's approval entry
      const relationshipApproval = await LoanApproval.findOne({
        loanApplication: loanApproval.loanApplication,
        approvalAction: 'Relationship Manager'
    });

    if (relationshipApproval?.assignee) {
        //get Relationship Manager details
        const relationshipAssignee = await Staff.findById(relationshipApproval.assignee)
            .select('first_name email');

        if (relationshipAssignee) {
            //send email to Relationship Manager
            await mailer.sendCommentAddedEmail(
                relationshipAssignee.email,
                relationshipAssignee.first_name,
                commenterId.first_name,
                comment,
                loanApproval.loanApplication
            );
        }
      }
      return newComment;
    } catch (error) {
      throw error;
    }
  };


  static async replyToComment(loanApprovalId, commentId, replyText, replier) {
    try {
      const loanApproval = await LoanApproval.findById(loanApprovalId).populate({
        path: 'assignee',
        select: 'first_name email',
      }); 
      console.log({loanApproval});
      
      if (!loanApproval) {
        throw new Error("LoanApproval not found");
      }
      const comment = loanApproval.comments.find((item) => item.commentId == commentId);
      console.log({comment});
      
      if (!comment) {
        throw new Error("Comment not found");
      }

      const newReply = {
        replyText,
        replier: replier,
        timestamp: Date.now()
      };

      comment.replies.push(newReply);
      await loanApproval.save();
      await mailer.sendCommentAddedEmail(loanApproval.assignee.email, loanApproval.assignee.first_name, replier.first_name, comment.replies[comment.replies.length], loanApproval.loanApplication);
      return newReply;
    } catch (error) {
      throw error;
    }
  };

  static async createApprovals(loanApplicationId, createdByType, createdBy, requesterId = null) {
    try {
      const approvals = [];
      const approvalLevels = [
        {
          level: 1,
          action: "Relationship Manager",
          title: "Relationship Manager",
          description:
            "They onboard the customer, understanding their business needs and gathering necessary information to tell the customer story",
          role: "RELATIONSHIP_MANAGER"
        },
        {
          level: 2,
          action: "Accounts Department",
          title: "Accounts Department",
          description:
            "They validate all the information provided, analyze the customer financial statements, and check whether the customer can afford the loan",
          role: "ACCOUNTS_DEPARTMENT"
        },
        {
          level: 3,
          action: "Internal Control",
          title: "Internal Control",
          description:
            "This team performs compliance checks, including verifying the collateral and reviewing all documentation. They also handle the shared allotment to ensure proper distribution of responsibilities",
          role: "INTERNAL_CONTROL"
        },
        {
          level: 4,
          action: "Risk Management",
          title: "Risk Management",
          description:
            "They verify the customer identity through BVN, perform a credit check, and generate a risk report to assess the potential risk involved in the loan.",
          role: "RISK_MANAGEMENT"
        },
        {
          level: 5,
          action: "Management Approval",
          title: "Management Approval",
          description:
            "Management reviews all the checks and reports, and once everything is in order, they approve the loan. Automated Step: The management approval triggers an automated offer letter that is sent to the customer for signing. The offer letter outlines the terms and conditions of the loan",
          role: "MANAGEMENT_APPROVAL"
        },
      ];

      const loan_Application = await loanApplication.findById(loanApplicationId)
      for (const { level, action, title, description, role } of approvalLevels) {
        let assigneeId = null;

        if (createdByType === "Staff" && level === 1) {
          // Assign the Relationship Manager as the createdBy staff
          assigneeId = createdBy;
        } else {
          // Fetch staff based on role and assign randomly
          const assigneeData = await AdminService.getStaffWithPerm(role);
          if (assigneeData.success && assigneeData.staff.length > 0) {
            const randomIndex = Math.floor(Math.random() * assigneeData.staff.length);
            assigneeId = assigneeData.staff[randomIndex]._id;
          }
        }

        const approval = new LoanApproval({
          approvalLevel: level,
          approvalAction: action,
          approvalTitle: title,
          approvalDescription: description,
          loanApplication: loanApplicationId,
          requester: requesterId,
          assignee: assigneeId, // Assigned Relationship Manager if "Staff", else random assignment
          status: "New",
          requestNote: "",
          approvalNote: "",
          comments: [],
          approvals: []
        });

        const savedApproval = await approval.save();
        approvals.push(savedApproval);

        try {
          //fetch assignee details
          const assignee = await Staff.findById(assigneeId).select("first_name last_name email");
          console.log("assignee: ", assignee)
          if (!assignee) continue;
  
          await mailer.sendRoleAssignmentEmail(
            assignee.email,
            assignee.first_name,
            (await Staff.findById(requesterId))?.first_name || "System",
            title,
            loanApplicationId,
            loan_Application.loan_id
          );
        } catch (emailError) {
          console.error(`Failed to send email for approval ${savedApproval._id}:`, emailError);
        }
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
      // Fetch all approvals and populate comments.commenter
      const approvals = await LoanApproval.find()
        .populate({
          path: 'comments.commenter',
          select: 'first_name email', // Fields you want to populate from 'Staff'
        })
        .populate({
          path: 'comments.replies.replier',
          select: 'first_name email', // Fields you want to populate from 'Staff'
        });
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
        .populate("assignee", "name email").populate('loanApplication')

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

      console.log({ approvals });


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

  static async approveApproval(approvalId, approvalNote, staffId, data) {
    try {
      // Step 1: Get the approval and handle missing approval
      const approval = await LoanApproval.findById(approvalId).populate('requester');
      if (!approval) {
        return {
          success: false,
          message: "Approval not found.",
          code: "NOT_FOUND",
        };
      }
  
      // Step 2: Check if the staff member is authorized to approve
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
  
      const loanApplicationUpdateResult = await this.updateLoanApplicationStatus(approval.loanApplication);
  
      const loanApp = await loanApplication
        .findById(approval.loanApplication)
        .populate({
          path: 'customer',
          populate: {
            path: ['kyc_verification','kyc_business']
          },
        })
        .populate('loan_product')
        .populate("repayments");

      console.log({loanApp});
      const loan_amount = loanApp.loan_amount
      const customer = loanApp.customer;
      const name = customer.business_name || customer.first_name + " " + customer.last_name;
      const address = customer.kyc_verification.address.address || customer.kyc_business.business_section.address

      const loan_product = await loanProduct.findById(loanApp.loan_product);
      const interest_rate = loan_product.interest;
      const facility_type = loan_product.name || loanApp.loan_product.name;
      const duration = loanApp.loan_duration;
      const purpose = loanApp.loan_purpose;
      const processing_fee = loanApp.processing_fee;
      const guarantor_1 = loanApp.guarantor1.name;
      const guarantor_2 = loanApp.guarantor2.name;

      //reapyment transformer
      const transformRepaymentsToRepaymentPlan = (repayments) => {
        return repayments.map(repayment => {
            return {
                amount: repayment.amount, // Map the 'amount' field
                date: new Date(repayment.due_date).toISOString().split('T')[0] //convert 'due_date' to YYYY-MM-DD
            };
        });
      };
      console.log("repayments: ", loanApp.repayments);
      const repayment_plan = transformRepaymentsToRepaymentPlan(loanApp.repayments);
      const loan_id = loanApp.loan_id;
      const offer_data = {
        name,
        address,
        loan_amount,
        facility_type,
        duration,
        purpose,
        interest_rate,
        processing_fee,
        security_guarantors:{
          guarantor_1,
          guarantor_2,
        },
        security_others: ["Vehicle Documents", "C of O"],
        repayment_plan,
        loan_id
      }

      console.log("offer_data: ", offer_data)

      const offer_letter = await generateOfferLetter(offer_data);
  
      // Step 6: Send email with offer letter
      const customerEmail = loanApp?.customer?.kyc_verification?.email?.address || loanApp?.customer?.kyc_business?.email?.address;
      console.log({customerEmail});
      
      const customerName = loanApp?.customer?.first_name || loanApp?.customer?.business_name;
      await mailer.sendOfferLetter(customerEmail, customerName, loanApp.loan_id, offer_letter.buffer);

      await loanApplication.findByIdAndUpdate(
        loanApp._id,
        { sent_offer_letter: offer_letter.url },
      );


      if (loanApplicationUpdateResult.success) {
   
        
        const approver = await Staff.findById(staffId);
        const approverName = `${approver?.first_name} ${approver?.last_name}`;
        
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

  
        return {
          success: true,
          message: "Approval approved successfully, Loan Application is ready for disbursement",
          approval: updatedApproval,
          loanApplication: loanApplicationUpdateResult.loanApplication,
        };
      }
  
      // If loan application update fails, still return success for approval
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
      if (!requester) {
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
      const approverName = `${approver.first_name} ${approver.last_name}`; const requesterName = `${requester.first_name} ${requester.last_name}`;
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

  //   static async addComment(approvalId, comment, staffId) {
  //   try {

  //     const approval = await LoanApproval.findById(approvalId);
  //     if (!approval) {
  //       return {
  //         success: false,
  //         message: "Approval not found.",
  //         code: "NOT_FOUND",
  //       };
  //     }

  //     // if (approval.status !== "Requested") {
  //     //   return {
  //     //     success: false,
  //     //     message: `Approval cannot have comments added because it is of status ${approval.status.toLowerCase()}.`,
  //     //     code: "INVALID_STATUS",
  //     //   };
  //     // }

  //     // if (approval.assignee.toString() !== staffId) {
  //     //   return {
  //     //     success: false,
  //     //     message: "You are not authorized to add a comment to this approval.",
  //     //     code: "UNAUTHORIZED",
  //     //   };
  //     // }

  //     // Add the comment to the additionalNote array (message trail)
  //     const staff = await Staff.findById(staffId);
  //     const name = `${staff.first_name} ${staff.last_name}`;

  //     approval.additionalNote.push({
  //       message: comment || "No comment provided.",
  //       sender: staff,
  //       timestamp: new Date(),
  //       noteType: 'Staff'
  //     });


  //     console.log({approval});
  //     const updatedApproval = await approval.save();

  //     await ActivityLogService.LogActivity(
  //       "update",
  //       "Staff",
  //       staffId,
  //       "LoanApplication",
  //       approval.loanApplication,
  //       {
  //         message: `${name} added a comment on the approval process for this Loan Application`,
  //       }
  //     );

  //     return {
  //       success: true,
  //       message: "Comment added successfully.",
  //       approval: updatedApproval,
  //     };
  //   } catch (error) {
  //     console.error("Error adding comment to approval:", error);
  //     return {
  //       success: false,
  //       message: `Error: ${error.message}`,
  //       code: "INTERNAL_ERROR",
  //     };
  //   }
  // }

};
