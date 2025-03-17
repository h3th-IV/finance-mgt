const mongoose = require("mongoose");

const LoanApplication = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        loan_id: {
            type: String,
        },
        loan_product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LoanProduct",
            required: true,
        },
        interest_rate: {
            type: Number,
        },
        loan_amount: {
            type: Number,
        },
        loan_duration: {
            type: Number,
        },
        statement_of_account: {
            type: String,
        },
        statement_of_networth: {
            type: String,
        },
        loan_purpose: {
            type: String,
        },
        repayment_mode: {
            type: String,
        },
        security_cheque: {
            type: String,
        },

        business_financial: {
            annual_revenue: { type: Number },
            bank_statements: { type: String },
            additional_documents: [{ type: String }],
        },
        collateral: {
            description_of_assets: { type: String },
            valuation_reports: { type: String },
            photographs: [{ type: String }],
        },
        other_documents: {
            business_plan: { type: String },
            insurance_documents: { type: String },
            tax_clearance: { type: String },
        },

        guarantor1: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone_number: { type: String, required: true },
        },
        guarantor2: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone_number: { type: String, required: true },
        },
        date_disbursed: {
            type: Date,
        },
        status: {
            type: String,
            enum: [
                "new",
                "processing",
                "approved",
                "disbursed",
                "overdue",
                "fully_paid",
                "closed",
                "ready_for_disbursement",
                "deleted",
                "declined"
            ],
            default: "processing",
        },
        repayment_plan: {
            monthlyPayment: {
                type: Number,
            },
            totalPayment: {
                type: Number,
            },
            totalInterest: {
                type: Number,
            },
            duration: {
                type: Number,
            },
            interestRate: {
                type: Number,
            },
            interestType: {
                type: String,
            }
        },
        repayments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Repayment",
            },
        ],
        processing_fee: {
            type: Number, //1% of the loan_amount (principal)
        },
        createdByType: {
            type: String,
            enum: ['User', 'Staff'],
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'createdByType',
            required: true
        },
        loan_type: {
            type: String,
            enum: ["individual", "business"],
            required: true, // This determines if the loan is for an individual or business
        },
        optional_documents: [
            {
                document_name: { type: String },
                document_url: { type: String },
                uploadedByType: {
                    type: String,
                    enum: ['User', 'Staff'],
                },
                uploaded_by: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'createdByType',
                },
                uploaded_at: {
                    type: Date,
                },
                notes: { type: String }
            }
        ],
        offer_letter: {
            letter: {
                type: String,
            },
            uploadedByType: {
                type: String,
                enum: ['User', 'Staff'],
            },
            uploaded_by: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'createdByType',
            },
            uploaded_at: {
                type: Date,
            },
        },
        sent_offer_letter:{
            type: String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("LoanApplication", LoanApplication);
