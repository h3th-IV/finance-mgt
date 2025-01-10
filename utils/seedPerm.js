const mongoose = require('mongoose');
const Permission = require('../models/permission');

const permissions = [
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
    {name: "VERIFY_DOCS", description: "Document verification officers" },
    {name: "CREATE_STAFF", description: "Create Staff" },
    {name: "ARCHIVE_LOAN_PRODUCT", description: "Archive Loan Product" },
    {name: "DELETE_USER", description: "Delete User Account" },
]

const seedPermissions = async () => {
    try {
        await mongoose.connect('mongodb+srv://victor:Maythird1.!@test.4f52hfp.mongodb.net/capitalwise?retryWrites=true&w=majority&appName=test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await Permission.deleteMany();

        await Permission.insertMany(permissions);

        console.log("Permissions seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding permissions:", error);
        process.exit(1);
    }
};

seedPermissions();