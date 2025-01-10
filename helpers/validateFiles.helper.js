const validateRequiredFiles = (files, loanType) => {
    if (loanType === "individual") {
        // For individual loans, validate these files
        const requiredIndividualFiles = [
            "statement_of_account",
            "statement_of_networth",
            "security_cheque",
        ];

        const missingFiles = requiredIndividualFiles.filter(
            (key) => !files[key] || !files[key][0]?.path
        );

        if (missingFiles.length > 0) {
            return `Missing required files for individual loan: ${missingFiles.join(", ")}`;
        }
    } else if (loanType === "business") {
        // For business loans, validate these files
        const requiredBusinessFiles = [
            "statement_of_account",  // still required for business loans
            "valuation_reports",     // additional required file for business loans
            "photographs",           // additional required file for business loans
        ];

        const missingFiles = requiredBusinessFiles.filter(
            (key) => !files[key] || !files[key][0]?.path
        );

        if (missingFiles.length > 0) {
            return `Missing required files for business loan: ${missingFiles.join(", ")}`;
        }

        // If business-specific fields are provided, ensure they are present in the files
        if (files["valuation_reports"] && files["valuation_reports"].length === 0) {
            return "Valuation reports are required for business loan.";
        }

        if (files["photographs"] && files["photographs"].length === 0) {
            return "Photographs of the collateral are required for business loan.";
        }
    }

    // If no issues, return null (no errors)
    return null;
};

module.exports = {
    validateRequiredFiles
}