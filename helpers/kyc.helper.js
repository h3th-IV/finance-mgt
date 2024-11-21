const User = require("../models/user")
const KYC = require('../models/kyc.js')


const fetchUserAndKYC = async (userId) => {
    const user = await User.findById(userId).populate('kyc_verification');
    if (!user) throw new Error("User not found");

    const kycRecord = user.kyc_verification
        ? await KYC.findById(user.kyc_verification._id)
        : null;

    return { user, kycRecord };
};


const combineKYCData = (kycData, files, kycRecord) => {
    return {
        ...kycData,
        'facial_verification.pic': files['facial_verification.pic']
            ? files['facial_verification.pic'][0].path
            : kycRecord?.facial_verification?.pic,
        'document_verification.doc': files['document_verification.doc']
            ? files['document_verification.doc'][0].path
            : kycRecord?.document_verification?.doc,
    };
};

const calculateStatuses = (kycData, files, kycRecord) => {
    const bankVerified =
        Boolean(kycData['bank_verification_number.bvn'] || kycRecord?.bank_verification_number?.bvn) &&
        Boolean(kycData['bank_verification_number.dob'] || kycRecord?.bank_verification_number?.dob);

    const facialVerified =
        Boolean(files['facial_verification.pic'] || kycRecord?.facial_verification?.pic);

    const documentVerified =
        Boolean(kycData['document_verification.doc_type'] || kycRecord?.document_verification?.doc_type) &&
        Boolean(kycData['document_verification.doc_no'] || kycRecord?.document_verification?.doc_no) &&
        Boolean(files['document_verification.doc'] || kycRecord?.document_verification?.doc) &&
        Boolean(kycData['document_verification.home_address'] || kycRecord?.document_verification?.home_address);

    return { bankVerified, facialVerified, documentVerified };
};

module.exports = {
    fetchUserAndKYC,
    combineKYCData,
    calculateStatuses,
};