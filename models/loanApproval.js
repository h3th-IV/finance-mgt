const mongoose = require("mongoose");

const LoanApprovalSchema = new mongoose.Schema({
  approvalLevel: {
    type: Number,
    required: true
  },
  approvalAction: {
    type: String,
    enum: ['Credit Check', 'Internal Control', 'Loan Disbursement'],
    default: "Credit Check"
  },
  approvalTitle: {
    type: String,
    enum: ['Relationship Manager', 'Accounts Dept', 'Management Approval'],
    default: "Credit Check"
  },
  approvalDescription: {
    type: String,
    enum: [
      'Responsible for initiating and managing client relationships throughout the loan process.',
      'Ensures internal controls, auditing, and compliance during financial transactions and loan disbursements.',
      'Requires final approval from management for loan decisions or special conditions.'
    ]
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
