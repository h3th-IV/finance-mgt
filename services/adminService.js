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

    static async updateLoanProduct(productId, updateData) {
        try {
            const loanProduct = await LoanProduct.findById(productId);
            if (!loanProduct) {
                return { success: false, message: "Loan product not found" };
            }

            const updatableFields = ["interest", "max", "min"];
            updatableFields.forEach((field) => {
                if (updateData[field] !== undefined) {
                    loanProduct[field] = updateData[field];
                }
            });

            await loanProduct.save();
            return {
                success: true,
                loanProduct,
            };
        } catch (error) {
            console.log('err: ', error);
            return { success: false, message: `Error updating loanProduct` };
        }

    }
}