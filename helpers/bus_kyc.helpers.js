const BusinessKYC = require('../models/business_kyc');
const user = require('../models/user');
const User = require("../models/user")

const fetchBusinessAndKYC = async (businessId) => {
    const business = await User.findById(businessId).populate('kyc_business');
    if (!business) {
        const error = new Error("business not found");
        error.statusCode = 404;
        throw error;
    }
    const kycRecord = business.kyc_business ? await BusinessKYC.findById(business.kyc_business._id): null;
    return { business, kycRecord };
};


const combineBusinessKYCData = (kycData, files = {}, kycRecord = {}) => {
    return {
        ...kycData,
        'business_address.proof_of_address': files?.['business_address.proof_of_address']?.[0]?.path
            || kycRecord?.business_address?.proof_of_address
            || undefined,
        'cac.certificate': files?.['cac_certificate']?.[0].path || kycRecord?.cac?.certificate || undefined
    };
};


const calculateBusinessStatuses = (kycData, files, kycRecord) => {
    const ownersVerified = kycRecord?.owners_partner_info.every(
        (owner) =>
            owner.name &&
            owner.phone_number &&
            owner.email &&
            owner.bvn &&
            owner.bvn.length === 11 &&
            /^\d+$/.test(owner.bvn)
    );

    const directorsVerified = kycRecord?.directors_bvn_verification.every(
        (director) =>
            director.director_name &&
            director.email &&
            director.bvn &&
            director.bvn.length === 11 &&
            /^\d+$/.test(director.bvn)
    );

    const addressVerified = Boolean(
        (kycData['business_address.address'] || kycRecord?.business_address?.address) &&
        (files['business_address.proof_of_address'] || kycRecord?.business_address?.proof_of_address)
    );

    const employeeSizeVerified = Boolean(
        (kycData['employee_size.size'] || kycRecord?.employee_size?.size) >= 1
    );

    const emailVerified = Boolean(
        (kycRecord?.email?.address || kycData['email.address']) &&
        kycRecord?.email?.otp === 'VERIFIED'
    );

    const cacVerified = Boolean(
        (kycData['cac.number'] || kycRecord?.cac?.number) &&
        (kycData['cac.certificate'] || kycRecord?.cac?.certificate)
    );

    const isFullyVerified =
        ownersVerified &&
        directorsVerified &&
        addressVerified &&
        employeeSizeVerified &&
        emailVerified &&
        cacVerified;

    return {
        ownersVerified,
        directorsVerified,
        addressVerified,
        employeeSizeVerified,
        emailVerified,
        cacVerified,
        isFullyVerified,
    };
};



module.exports = {
    fetchBusinessAndKYC,
    combineBusinessKYCData,
    calculateBusinessStatuses,
};
