const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/responses')
module.exports = class AdminCOntroller{
    static async getAllkycs(req, res) {
        try{
            const kycs = await AdminService.getAllkyc();
            return successResponse(res, 200, "KYCs returned successfully", kycs);
        } catch(error){
            return errorResponse(res, 500, "Server error");
        }
    }
}