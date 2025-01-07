const User = require("../models/user")
const KYC = require('../models/kyc.js')


const fetchUserAndKYC = async (userId) => {
    const user = await User.findById(userId).populate('kyc_verification');
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const kycRecord = user.kyc_verification ? await KYC.findById(user.kyc_verification._id): null;
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
        'address.proof_of_address': files['address.proof_of_address']
            ? files['address.proof_of_address'][0].path
            : kycRecord?.address?.proof_of_address,
    };
};


const calculateStatuses = (kycData, files, kycRecord) => {
    const emailVerified = Boolean(
        kycRecord?.email?.address && kycRecord?.email?.status === true
    );

    const bankVerified = Boolean(
        (kycData['bank_verification_number.bvn'] || kycRecord?.bank_verification_number?.bvn) &&
        (kycData['bank_verification_number.dob'] || kycRecord?.bank_verification_number?.dob) &&
        ((kycData['bank_verification_number.otp'] === "VERIFIED") || (kycRecord?.bank_verification_number?.otp === "VERIFIED"))
    );

    const utilityBillVerified = Boolean(
        (files['utility_bill.doc'] || kycRecord?.utility_bill?.doc) &&
        (kycData['utility_bill.home_address'] || kycRecord?.utility_bill?.home_address)
    );

    const documentVerified = Boolean(
        (kycData['document_verification.doc_type'] || kycRecord?.document_verification?.doc_type) &&
        (kycData['document_verification.doc_no'] || kycRecord?.document_verification?.doc_no) &&
        (files['document_verification.doc'] || kycRecord?.document_verification?.doc)
    );

    const addressVerified = Boolean(
        (kycData['address.address'] || kycRecord?.address?.address) &&
        (files['address.proof_of_address'] || kycRecord?.address?.proof_of_address)
    );

    const isSelfEmployed = kycData['employment_info.employment_status'] === 'self_employed' ||
        kycRecord?.employment_info?.employment_status === 'self_employed';

    const employmentInfoVerified = isSelfEmployed || Boolean(
        (kycData['employment_info.employer_name'] || kycRecord?.employment_info?.employer_name) &&
        (kycData['employment_info.employer_phone'] || kycRecord?.employment_info?.employer_phone) &&
        (kycData['employment_info.employer_email'] || kycRecord?.employment_info?.employer_email) &&
        (kycData['employment_info.employer_address'] || kycRecord?.employment_info?.employer_address)
    );

    return {
        emailVerified,
        bankVerified,
        utilityBillVerified,
        documentVerified,
        addressVerified,
        employmentInfoVerified,
    };
};



module.exports = {
    fetchUserAndKYC,
    combineKYCData,
    calculateStatuses,
};