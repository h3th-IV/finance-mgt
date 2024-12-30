const mongoose = require('mongoose');

// Step 1: Define the BVN Data Schema
const GuarantorsData = new mongoose.Schema({

    loanApplicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoanApplication",
        required: true,
    },
    firstName: { 
        type: String, 
        required: true 
    },
    middleName: { 
        type: String
    },
    lastName: { 
        type: String,
        required: true
    },
    email: { 
        type: String,
        required: true
    },
    file: { 
        type: String
    },
    mobile: { 
        type: String,
        required: true
    },
    dateOfBirth: { 
        type: Date,
        required: true
    },
    gender: { 
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    idNumber: { 
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('GuarantorsData', GuarantorsData);