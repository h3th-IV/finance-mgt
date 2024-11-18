const KYC  = require('../models/kyc');

module.exports = class AdminService{
    static async getAllkyc(){
        try {
            const kycs = await KYC.find();
            return kycs;
        } catch (error) {
            return error;
        }
    }
}