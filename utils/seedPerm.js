const mongoose = require('mongoose');
const Permission = require('../models/permission');

const permissions = [
    { name: "VIEW_CREATED_LOAN_APP", description: "View Created loan applications" },
    { name: "VIEW_LOAN_APP", description: "View loan applications" },
    { name: "CREATE_LOAN_PRODUCT", description: "Create loan products" },
    { name: "CREATE_LOAN_APP", description: "Create loan application" },
    { name: "APPROVE_LOAN_APP", description: "Approve loan applications" },
    { name: "DECLINE_LOAN_APP", description: "Decline loan applications" },
    { name: "UPDATE_LOAN_APP", description: "Update loan applications" },
    { name: "DISBURSE_LOAN_APP", description: "Disburse loan applications" },
    { name: "UPDATE_LOAN_PRODUCT", description: "Update loan products" },
    { name: "DELETE_LOAN_PRODUCT", description: "Delete loan products" },
    { name: "DELETE_LOAN_APP", description: "Delete loan applications" },
    { name: "CREATE_ROLE", description: "Admin create new role and assign permissions" },
    { name: "VERIFY_DOCS", description: "Document verification officers" },
    { name: "CREATE_STAFF", description: "Create Staff" },
    { name: "ARCHIVE_LOAN_PRODUCT", description: "Archive Loan Product" },
    { name: "DELETE_CUSTOMER", description: "Delete Customer Account" },
    { name: "CREATE_CUSTOMER", description: "Create Customer Account" },
    { name: "CREDIT_CHECK", description: "Credit check for customer" },
    { name: "INTERNAL_CONTROL", description: "This team performs compliance checks, including verifying the collateral and reviewing all documentation." }, // Merged duplicate
    { name: "RISK_MANAGEMENT", description: "They verify the customer identity through BVN, perform a credit check, and generate a risk report to assess the potential risk involved in the loan." },
    { name: "MANAGEMENT_APPROVAL", description: "Management reviews all the checks and reports, and once everything is in order, they approve the loan. Automated Step: The management approval triggers an automated offer letter that is sent to the customer for signing." },
    { name: "CUSTOMER_SIGNATURE", description: "Once the customer signs the offer letter, the loan agreement is finalized." },
    { name: "LOAN_DISBURSEMENT", description: "After the signed offer letter is received, the loan is disbursed to the customer, completing the process." },
    { name: "RELATIONSHIP_MANAGER", description: "They onboard the customer, understanding their business needs and gathering necessary information to tell the customer story." },
    { name: "APPROVE_BORROWERS_CREDIT", description: "The customers record is checked if they have a good borrowers credit score" },
    { name: "ACCOUNTS_DEPARTMENT", description: "The customers record is checked if they have a good borrowers credit score" },
];

// Validate permissions for uniqueness
function validatePermissions(permissions) {
    const names = permissions.map(p => p.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

    if (duplicates.length > 0) {
        throw new Error(`Duplicate permission names found: ${duplicates.join(", ")}`);
    }
}

// Seed permissions
const seedPermissions = async () => {
    try {
        validatePermissions(permissions);

        //connect to MongoDB
        await mongoose.connect('mongodb+srv://victor:Maythird1.!@test.4f52hfp.mongodb.net/capitalwise?retryWrites=true&w=majority');

        //clear existing permissions
        await Permission.deleteMany();

        await Permission.insertMany(permissions);

        console.log("Permissions seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding permissions:", error.message);
        process.exit(1);
    }
};

seedPermissions();