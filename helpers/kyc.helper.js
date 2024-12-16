const User = require("../models/user")
const KYC = require('../models/kyc.js')


const fetchUserAndKYC = async (userId) => {
    const user = await User.findById(userId).populate('kyc_verification');
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const kycRecord = user.kyc_verification
        ? await KYC.findById(user.kyc_verification._id)
        : null;

    return { user, kycRecord };
};


const combineKYCData = (kycData, files, kycRecord) => {
    return {
        ...kycData,
        'utility_bill.doc': files['utility_bill.doc']
            ? files['utility_bill.doc'][0].path
            : kycRecord?.utility_bill?.doc,
        'document_verification.doc': files['document_verification.doc']
            ? files['document_verification.doc'][0].path
            : kycRecord?.document_verification?.doc,
    };
};

const calculateStatuses = (kycData, files, kycRecord) => {
    const emailVerified = Boolean(kycRecord?.email?.address && kycRecord?.email?.status === true);

    const bankVerified =
        Boolean(kycData['bank_verification_number.bvn'] || kycRecord?.bank_verification_number?.bvn) &&
        Boolean(kycData['bank_verification_number.dob'] || kycRecord?.bank_verification_number?.dob);

    const utilityBillVerified =
        Boolean(files['utility_bill.doc'] || kycRecord?.utility_bill?.doc);

    const documentVerified =
        Boolean(kycData['document_verification.doc_type'] || kycRecord?.document_verification?.doc_type) &&
        Boolean(kycData['document_verification.doc_no'] || kycRecord?.document_verification?.doc_no) &&
        Boolean(files['document_verification.doc'] || kycRecord?.document_verification?.doc) &&
        Boolean(kycData['document_verification.home_address'] || kycRecord?.document_verification?.home_address);

    return { emailVerified, bankVerified, utilityBillVerified, documentVerified };
};

module.exports = {
    fetchUserAndKYC,
    combineKYCData,
    calculateStatuses,
};