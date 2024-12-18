const validateRequiredFiles = (files) => {
    const requiredGuarantorFiles = [
        // "guarantor.kyc_guarantor_form",
        // "guarantor.passport_form",
        "statement_of_networth",
        "security_cheque",
    ];

    const missingGuarantorFiles = requiredGuarantorFiles.filter(
        (key) => !files[key] || !files[key][0]?.path
    );

    if (missingGuarantorFiles.length > 0) {
        return `Missing required guarantor files: ${missingGuarantorFiles.join(", ")}`;
    }

    if (!files["statement_of_account"] || !files["statement_of_account"][0]?.path) {
        return "Statement of account is required.";
    }

    return null;
};

module.exports = {
    validateRequiredFiles
}