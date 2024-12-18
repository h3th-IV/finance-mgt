const BVNData = require('../models/bvnData');

module.exports = class BVNDataService{
    static async createBVNData(bvnDataObject) {
        try {
            const bvnData = new BVNData({
                customer: bvnDataObject.userId,
                bvn: bvnDataObject.idNumber,
                firstName: bvnDataObject.firstName,
                middleName: bvnDataObject.middleName || '',
                lastName: bvnDataObject.lastName,
                image: bvnDataObject.image,
                mobile: bvnDataObject.mobile,
                dateOfBirth: new Date(bvnDataObject.dateOfBirth),
                gender: bvnDataObject.gender,
                idNumber: bvnDataObject.idNumber,
                status: bvnDataObject.status,
                allValidationPassed: bvnDataObject.allValidationPassed,
                country: bvnDataObject.country,
                requestedAt: new Date(bvnDataObject.requestedAt),
                metadata: bvnDataObject.metadata,
            });

            await bvnData.save();
            return { success: true, message: 'BVN data saved successfully.', data: bvnData };
        } catch (error) {
            console.error('Error saving BVN data:', error);
            return { success: false, message: 'Error saving BVN data.', error: error.message };
        }
    }

    static async getAllBVNData(){
        try{
            const bvnData = await BVNData.find()
            // await BVNData.deleteMany();
            return { success: true, bvnData};
        }catch(error){
            console.error('Error fetching all BVN data:', error);
            return { success: false, message: 'Error fetching all BVN data.', error: error.message };
        }
    }
}