const mongoose = require("mongoose")


const LoanApprovalSchema = new mongoose.Schema({
  approvalLevel: {
    type: Number,
    required: true
  },
  approvalAction: {
    type: String,
    enum: ['Credit Check', 'Internal Control', 'Approve Borrowers Credit', 'Loan Disursement'],
    default: "Credit Check"
  },
  approvalTitle: {
    type: String,
    enum: ['Credit Check', 'Internal Control', 'Approve Borrowers Credit', 'Loan Disursement'],
    default: "Credit Check"
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
  }
});

LoanApprovalSchema.set("timestamps", true);

module.exports = mongoose.model("LoanApproval", LoanApprovalSchema);
