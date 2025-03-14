const mongoose = require('mongoose');


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
    },
    isActive: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    }
}, { timestamps: true });

module.exports = mongoose.model('GuarantorsData', GuarantorsData);