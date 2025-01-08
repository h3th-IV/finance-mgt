const mongoose = require('mongoose');

const BusinessKYCSchema = new mongoose.Schema(
    {
        owners_partner_info: [
            {
                name: {
                    type: String,
                    required: true,
                },
                phone_number: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                },
                bvn: {
                    type: String,
                    required: true,
                    length: 11,
                    match: /^\d+$/,
                },
                status: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        business_registration: {
            certificate: {
                type: String,
                required: true,
            },
            status: {
                type: Boolean,
                default: false,
            },
        },
        directors_bvn_verification: [
            {
                director_name: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                },
                bvn: {
                    type: String,
                    required: true,
                    length: 11,
                    match: /^\d+$/,
                },
                status: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        business_address: {
            address: {
                type: String,
                required: true,
            },
            proof_of_address: {
                type: String,
                required: true,
            },
            status: {
                type: Boolean,
                default: false,
            },
        },
        employee_size: {
            size: {
                type: Number,
                required: true,
                min: 1,
            },
            status: {
                type: Boolean,
                default: false,
            },
        },
    },
    { timestamps: true }
);

//heleper to check all fields are verified
BusinessKYCSchema.methods.calculateStatuses = function () {
    const ownersVerified = this.owners_partner_info.every((owner) => owner.status === true);
    const registrationVerified = Boolean(this.business_registration.status);
    const directorsVerified = this.directors_bvn_verification.every((director) => director.status === true);
    const addressVerified = Boolean(this.business_address.status);
    const employeeSizeVerified = Boolean(this.employee_size.status);

    return {
        ownersVerified,
        registrationVerified,
        directorsVerified,
        addressVerified,
        employeeSizeVerified,
        isFullyVerified: ownersVerified && registrationVerified && directorsVerified && addressVerified && employeeSizeVerified,
    };
};

module.exports = mongoose.model('BusinessKYC', BusinessKYCSchema);
