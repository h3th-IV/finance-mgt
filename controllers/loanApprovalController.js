const LoanApprovalService = require("../services/loanApprovalService");
const { successResponse, errorResponse } = require('../utils/responses');

module.exports = class LoanApprovalController {
    
    static async fetchApprovalsForLoanApplication(req, res) {
        try {
            const { loanApplicationId } = req.params;
            if (!loanApplicationId){
                return errorResponse(res, 400, "Missing loanApplicationId")
            }
            if (loanApplicationId == ":loanApplicationId"){
                return errorResponse(res, 400, "Missing loanApplicationId")
            }
            const result = await LoanApprovalService.fetchApprovalsForLoanApplication(loanApplicationId);
            
            if (!result.success) {
                return errorResponse(res, 404, result.message);
            }
            
            return successResponse(res, 200, result.message, result.approvals);
        } catch (error) {
            console.error("Controller Error - fetchApprovalsForLoanApplication:", error);
            return errorResponse(res, 500, "Server error");
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
        const { approvalId } = req.params;
        const { assigneeId, requestNote } = req.body;
        try {
            if(!approvalId){
                return errorResponse(res, 400, "Missing approvalId in request parameters");
            }
          const response = await LoanApprovalService.requestApproval(approvalId, assigneeId, requestNote);
    
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
      
        try {
          if (!approvalId) {
            return errorResponse(res, 400, "Missing approvalId in request parameters");
          }
      
          const result = await LoanApprovalService.approveApproval(approvalId, approvalNote, staffId);
      
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
};
