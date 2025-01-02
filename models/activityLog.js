const mongoose = require("mongoose");

const ActivityLog = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "approve",
        "disburse",
        "archive",
      ],
    },
    performedByType: {
      type: String,
      required: true,
      enum: ["User", "Staff"],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "performedByType",
      required: true,
    },
    targetModel: {
      type: String,
      required: true,
      enum: ["LoanApplication", "LoanProduct"],
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "targetModel",
      required: true,
    },
    details: {
      type: Map,
      of: String, // would be key-value pair for metadata (e.g., oldValue, newValue)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLog);
