const mongoose = require('mongoose');

const BusinessKYCSchema = new mongoose.Schema(
    {
        email: {
            address: {
                type: String,
            },
            otp: {
                type: String
            },
            otpCreatedAt: {
                type: Date,
            },
            status: {
                type: Boolean,
                default: false
            },
        },
        owners_partner_info: [
            {
                name: {
                    type: String,
                },
                phone_number: {
                    type: String,
                },
                email: {
                    type: String,
                },
                bvn: {
                    type: String,
                    length: 11,
                    match: /^\d+$/,
                },
                status: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // directors_bvn_verification: [
        //     {
        //         director_name: {
        //             type: String,
        //         },
        //         email: {
        //             type: String,
        //         },
        //         bvn: {
        //             type: String,
        //             length: 11,
        //             match: /^\d+$/,
        //         },
        //         status: {
        //             type: Boolean,
        //             default: false,
        //         },
        //     },
        // ],
        business_section: {
            address: {
                type: String,
            },
            proof_of_address: {
                type: String,
            },
            type: {
                type: String,
            },
            date_of_corporation: {
                type: String,
            },
            status: {
                type: Boolean,
                default: false,
            },
        },
        employee_size: {
            size: {
                type: Number,
                min: 1,
            },
            status: {
                type: Boolean,
                default: false,
            },
        },
        cac: {
            number: {
                type: String,
            },
            certificate: {
                type: String,
            },
            status: {
                type: Boolean,
                default: false
            },
        },
    },
    { timestamps: true }
);

//check for existing rmails
BusinessKYCSchema.statics.checkForExistingEmails = async function (emails) {
    const results = await this.find({
        $or: [
            { 'owners_partner_info.email': { $in: emails } },
            { 'directors_bvn_verification.email': { $in: emails } },
        ],
    }).select({
        'owners_partner_info.email': 1,
        'directors_bvn_verification.email': 1,
    });

    const existingEmails = results.flatMap((record) => [
        ...record.owners_partner_info.map((owner) => owner.email),
        ...record.directors_bvn_verification.map((director) => director.email),
    ]);

    return existingEmails.filter((email) => emails.includes(email));
};


BusinessKYCSchema.statics.checkForExistingBVNs = async function (bvns) {
    const results = await this.find({
        $or: [
            { 'owners_partner_info.bvn': { $in: bvns } },
            { 'directors_bvn_verification.bvn': { $in: bvns } },
        ],
    }).select({
        'owners_partner_info.bvn': 1,
        'directors_bvn_verification.bvn': 1,
    });

    const existingBVNs = results.flatMap((record) => [
        ...record.owners_partner_info.map((owner) => owner.bvn),
        ...record.directors_bvn_verification.map((director) => director.bvn),
    ]);

    return existingBVNs.filter((bvn) => bvns.includes(bvn));
};


//heleper to check all fields are verified
BusinessKYCSchema.methods.calculateStatuses = function () {
    const ownersVerified = this.owners_partner_info.every((owner) => owner.status === true);
    const registrationVerified = Boolean(this.business_registration.status);
 //   const directorsVerified = this.directors_bvn_verification.every((director) => director.status === true);
    const addressVerified = Boolean(this.business_section.status);
    const employeeSizeVerified = Boolean(this.employee_size.status);

    return {
        ownersVerified,
        registrationVerified,
 //       directorsVerified,
        addressVerified,
        employeeSizeVerified,
        isFullyVerified: ownersVerified && registrationVerified && addressVerified && employeeSizeVerified,
    };
};

module.exports = mongoose.model('BusinessKYC', BusinessKYCSchema);
