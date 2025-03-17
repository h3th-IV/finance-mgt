const mongoose = require("mongoose");
const Staff = require("./staff");
const LoanPackage = require("./loanPackage");

const LoanProjection = new mongoose.Schema(
  {
    year: {
      type: Number, // Year for the projections
      required: true,
    },
    loan_package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct", // Reference to Loan Package
      required: true,
    },
    projections: {
      january: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      february: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      march: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      april: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      may: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      june: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      july: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      august: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      september: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      october: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      november: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
      december: { loan_amount: { type: Number, default: 0 }, loan_count: { type: Number, default: 0 } },
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Staff",
    //   required: true,
    // },
  },
  { timestamps: true }
);

LoanProjection.index({ loan_package: 1, year: 1 }, { unique: true }); // Ensure only one projection per package per year

module.exports = mongoose.model("LoanProjection", LoanProjection);
