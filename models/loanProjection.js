const mongoose = require("mongoose");
const Staff = require("./staff");

const LoanProjection = new mongoose.Schema(
  {
    year: {
      type: Number, // Year for the projections
      required: true,
    },
    january: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    february: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    march: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    april: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    may: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    june: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    july: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    august: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    september: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    october: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    november: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    december: {
      loan_amount: { type: Number, required: true },
      loan_count: { type: Number, required: true },
    },
    // action_by: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Staff", 
    //   required: true,
    // },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("LoanProjection", LoanProjection);
