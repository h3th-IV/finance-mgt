const KYC  = require('../models/kyc');
const LoanProduct = require('../models/loanProduct');

module.exports = class AdminService{
    static async getAllkyc(){
        try {
            const kycs = await KYC.find();
            return kycs;
        } catch (error) {
            return error;
        }
    }

    static async createLoanProduct(product_data){
        try {
            const newloanProduct = {
                name: product_data.name,
                desc: product_data.desc,
                interest: product_data.interest,
                max: product_data.max,
                min: product_data.min,
                createdBy: product_data.createdBy
            }
            const loanProduct = await new LoanProduct(newloanProduct).save();
            return loanProduct;
        } catch (error) {
            return error;
        }
    }
}