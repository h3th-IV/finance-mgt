const mongoose = require("mongoose");

const LoanApprovalSchema = new mongoose.Schema({
  approvalLevel: {
    type: Number,
    required: true
  },
  approvalAction: {
    type: String,
    enum: ['Relationship Manager', 'Accounts Department', 'Internal Control', 'Risk Management', 'Management Approval', 'Customer Signature', 'Loan Disbursement'],
    default: "Credit Check"
  },
  approvalTitle: {
    type: String,
    enum: ['Relationship Manager', 'Accounts Department', 'Internal Control', 'Risk Management', 'Management Approval', 'Customer Signature', 'Loan Disbursement'],
    default: "Credit Check"
  },
  approvalDescription: {
    type: String,
    enum: [
      "They onboard the customer, understanding their business needs and gathering necessary information to tell the customer story",

      "They validate all the information provided, analyze the customer financial statements, and check whether the customer can afford the loan",

      "This team performs compliance checks, including verifying the collateral and reviewing all documentation. They also handle the shared allotment to ensure proper distribution of responsibilities",

      "They verify the customer identity through BVN, perform a credit check, and generate a risk report to assess the potential risk involved in the loan.",

      "Management reviews all the checks and reports, and once everything is in order, they approve the loan. Automated Step: The management approval triggers an automated offer letter that is sent to the customer for signing. The offer letter outlines the terms and conditions of the loan",

      "Once the customer signs the offer letter, the loan agreement is finalized", 

      "After the signed offer letter is received, the loan is disbursed to the customer, completing the process."
    ]
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: false
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: false
  },
  loanApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LoanApplication",
    required: true
  },
  requestNote: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    default: "New",
    enum: ["New", "Requested", "Approved", "Declined"]
  },
  approvalNote: {
    type: String,
  },
  declineNote: {
    type: String,
  },
  additionalNote: [
    {
      message: {
        type: String,
        required: true
      },
      sender: {
        type: Object,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

LoanApprovalSchema.set("timestamps", true);

module.exports = mongoose.model("LoanApproval", LoanApprovalSchema);
