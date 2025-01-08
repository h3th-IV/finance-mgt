const BusinessKYC = require('../models/businessKYC');

const fetchBusinessKYC = async (businessId) => {
    const kycRecord = await BusinessKYC.findById(businessId);
    if (!kycRecord) {
        const error = new Error("Business KYC record not found");
        error.statusCode = 404;
        throw error;
    }
    return kycRecord;
};

const combineBusinessKYCData = (kycData, files, kycRecord) => {
    return {
        ...kycData,
        'business_registration.certificate': files['business_registration.certificate']
            ? files['business_registration.certificate'][0].path
            : kycRecord?.business_registration?.certificate,
        'business_address.proof_of_address': files['business_address.proof_of_address']
            ? files['business_address.proof_of_address'][0].path
            : kycRecord?.business_address?.proof_of_address,
    };
};

const calculateBusinessStatuses = (kycData, files, kycRecord) => {
    const ownersVerified = Boolean(
        kycRecord?.owners_partner_info.every((owner) => owner.status)
    );

    const registrationVerified = Boolean(
        kycData['business_registration.certificate'] ||
        kycRecord?.business_registration?.certificate
    );

    const directorsVerified = Boolean(
        kycRecord?.directors_bvn_verification.every((director) => director.status)
    );

    const addressVerified = Boolean(
        kycData['business_address.address'] ||
        (files['business_address.proof_of_address'] || kycRecord?.business_address?.proof_of_address)
    );

    const employeeSizeVerified = Boolean(
        kycData['employee_size.size'] || kycRecord?.employee_size?.status
    );

    return {
        ownersVerified,
        registrationVerified,
        directorsVerified,
        addressVerified,
        employeeSizeVerified,
        isFullyVerified: ownersVerified && registrationVerified && directorsVerified && addressVerified && employeeSizeVerified,
    };
};

module.exports = {
    fetchBusinessKYC,
    combineBusinessKYCData,
    calculateBusinessStatuses,
};
