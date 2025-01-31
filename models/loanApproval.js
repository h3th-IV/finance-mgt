const mongoose = require("mongoose")


const LoanApprovalSchema = new mongoose.Schema({
  approvalLevel: {
    type: Number,
    required: true
  },
  approvalAction: {
    type: String,
    enum: ['action-1', 'action-2', 'action-3', 'action-4', 'action-5'],
    default: "action-1"
  },
  approvalTitle: {
    type: String,
    enum: ['title-1', 'title-2', 'title-3', 'title-4', 'title-5'],
    default: "title-1"
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
