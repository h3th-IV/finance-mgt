const AdminService = require("../services/adminService");
const LoanApprovalService = require("../services/loanApprovalService");
const { successResponse, errorResponse } = require('../utils/responses');

module.exports = class LoanApprovalController {
  static async fetchApprovalsForLoanApplication(req, res) {
    try {
        const { loanApplicationId } = req.params;

        if (!loanApplicationId || loanApplicationId === ":loanApplicationId") {
            return errorResponse(res, 400, "Missing or invalid loanApplicationId");
        }

        const approvals = await LoanApprovalService.fetchApprovalsForLoanApplication(loanApplicationId);

        return successResponse(res, 200, "Approvals fetched successfully", approvals);
    } catch (error) {
        console.error("Controller Error - fetchApprovalsForLoanApplication:", error);

        if (error.message === "No approvals found for this loan application.") {
            return errorResponse(res, 404, "No approvals found for this loan application.");
        }

        return errorResponse(res, 500, "An unexpected server error occurred.");
    }
  }

  static async getApprovalById(req, res) {
    try {
        const { id } = req.params;
        const approval = await LoanApprovalService.getApprovalById(id);
        return successResponse(res, 200, "Approval fetched successfully", approval);
    } catch (error) {
        console.error("Error fetching approval by ID:", error);
        if (error.message === "Approval not found") {
            return errorResponse(res, 404, "Approval not found");
        }

        return errorResponse(res, 500, "An unexpected error occurred while fetching the approval.");
    }
  }

    static async fetchAllApprovals(req, res) {
        try {
            const result = await LoanApprovalService.fetchAllApprovals();
            
            if (!result.success) {
                return errorResponse(res, 404, result.message);
            }
            
            return successResponse(res, 200, result.message, result.approvals);
        } catch (error) {
            console.error("Controller Error - fetchAllApprovals:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async fetchApprovalsByAssignee(req, res) {
        try {
            const { assigneeId } = req.params;
            if (!assigneeId){
                return errorResponse(res, 400, "Missing assigneeId in request parameters");
            }
            const result = await LoanApprovalService.fetchApprovalsByAssignee(assigneeId);
            
            if (!result.success) {
                return errorResponse(res, 404, result.message);
            }
            
            return successResponse(res, 200, result.message, result.approvals);
        } catch (error) {
            console.error("Controller Error - fetchApprovalsByAssignee:", error);
            return errorResponse(res, 500, "Server error");
        }
    }

    static async requestApproval(req, res) {
        const staffId = req.user.id;
        const { approvalId } = req.params;
        const { assigneeId, requestNote } = req.body;
        try {
            if(!approvalId){
                return errorResponse(res, 400, "Missing approvalId in request parameters");
            }
          const response = await LoanApprovalService.requestApproval(approvalId, assigneeId, requestNote, staffId);
    
          if (!response.success) {
            switch (response.code) {
              case "NOT_FOUND":
                return errorResponse(res, 404, response.message);
              case "INVALID_STATUS":
                return errorResponse(res, 400, response.message);
              default:
                return errorResponse(res, 500, response.message);
            }
          }
    
          return successResponse(res, 200, response.message, response.approval);
        } catch (error) {
          console.error("Controller Error - requestApproval:", error);
          return errorResponse(res, 500, "Server error");
        }
    }

      static async declineApproval(req, res) {
        const { approvalId } = req.params;
        const { declineNote } = req.body;
        const staffId = req.user.id;
      
        try {
          if (!approvalId) {
            return errorResponse(res, 400, "Missing approvalId in request parameters");
          }
      
          const result = await LoanApprovalService.declineApproval(approvalId, declineNote, staffId);
      
          if (!result.success) {
            switch (result.code) {
              case "NOT_FOUND":
                return errorResponse(res, 404, result.message);
              case "INVALID_STATUS":
                return errorResponse(res, 400, result.message);
              case "MISSING_DECLINE_NOTE":
                return errorResponse(res, 400, result.message);
              case "UNAUTHORIZED":
                return errorResponse(res, 403, result.message);
              default:
                return errorResponse(res, 500, result.message);
            }
          }
      
          return successResponse(res, 200, result.message, result.approval);
        } catch (error) {
          console.error("Controller Error - declineApproval:", error);
          return errorResponse(res, 500, "Server error");
        }
      }


    static async approveApproval(req, res) {
        const { approvalId } = req.params;
        const { approvalNote } = req.body;
        const staffId = req.user.id;

        console.log({staffId});
        const data = { };
      
        try {
          if (!approvalId) {
            return errorResponse(res, 400, "Missing approvalId in request parameters");
          }
      
          const result = await LoanApprovalService.approveApproval(approvalId, approvalNote, staffId, data);
          if (!result.success) {
            switch (result.code) {
              case "NOT_FOUND":
                return errorResponse(res, 404, result.message);
              case "INVALID_STATUS":
                return errorResponse(res, 400, result.message);
              case "UNAUTHORIZED":
                return errorResponse(res, 403, result.message);
              default:
                return errorResponse(res, 500, result.message);
            }
          }
          return successResponse(res, 200, result.message, result.approval);
        } catch (error) {
          console.error("Controller Error - approveApproval:", error);
          return errorResponse(res, 500, "Server error");
        }
      }


    static async requestComment(req, res) {
      const { approvalId } = req.params;
      const { comment } = req.body;
      const staffId = req.user.id;
      try {
        if (!approvalId) {
          return errorResponse(res, 400, "Missing approvalId in request parameters");
        }
    
        const result = await LoanApprovalService.addComment(approvalId, comment, staffId);
    
        if (!result.success) {
          switch (result.code) {
            case "NOT_FOUND":
              return errorResponse(res, 404, result.message);
            case "INVALID_STATUS":
              return errorResponse(res, 400, result.message);
            case "UNAUTHORIZED":
              return errorResponse(res, 403, result.message);
            default:
              return errorResponse(res, 500, result.message);
          }
        }
        return successResponse(res, 200, result.message, result.approval);
      } catch (error) {
        console.error("Controller Error - request comment:", error);
        return errorResponse(res, 500, "Server error");
      }
    }

    static async addComment  (req, res) {
      const { loanApprovalId } = req.params;
      const { comment } = req.body;
      const commenterId = await AdminService.getStaffById(req.user.id);  
      try {
        const newComment = await LoanApprovalService.addComment(loanApprovalId, comment, commenterId);
        return res.status(201).json({ success: true, newComment });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    };
    
    // Controller to handle replying to a comment on a LoanApproval
    static async replyToComment  (req, res) {
      const { loanApprovalId, commentId } = req.params;
      const { replyText } = req.body;
      const replierId = req.user.id;  
      const replier = await AdminService.getStaffById(req.user.id);  
    
      try {
        const newReply = await LoanApprovalService.replyToComment(loanApprovalId, commentId, replyText, replier);
        return res.status(201).json({ success: true, newReply });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    };
};
