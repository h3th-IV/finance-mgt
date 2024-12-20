const mongoose = require('mongoose');

// Step 1: Define the BVN Data Schema
const BVNData = new mongoose.Schema({
    bvn: { 
        type: String,
        required: true,
        unique: true
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
    image: { 
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
    status: { 
        type: String,
        required: true
    },
    allValidationPassed: { 
        type: Boolean,
        required: true
    },
    country: { 
        type: String,
        required: true
    },
    requestedAt: { 
        type: Date,
        required: true
    },
    metadata: { 
        type: Object
    },
}, { timestamps: true });

module.exports = mongoose.model('BVNData', BVNData);