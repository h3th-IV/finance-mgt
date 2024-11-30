const mongoose = require('mongoose');
const Permission = require('../models/permission');

const permissions = [
    { name: "getloanApplications", description: "View loan applications" },
    { name: "createloanProduct", description: "Create loan products" },
    { name: "approveloanApplication", description: "Approve loan applications" },
    { name: "declineloanApplication", description: "Decline loan applications" },
    { name: "updateloanApplication", description: "Update loan applications" },
    { name: "disburseLoanApplication", description: "Disburse loan applications" },
    { name: "updateLoanProduct", description: "Update loan products" },
    { name: "deleteLoanProduct", description: "Delete loan products" },
    { name: "deleteLoanApplication", description: "Delete loan applications" },
    { name: "createRole", description: "Admin create new role and assign permissions" },
    {name: "verifyDocs", description: "Document verification officers" }
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