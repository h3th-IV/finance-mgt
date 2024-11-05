const mongoose = require("mongoose");
const User = require("./user");

const customerDocument = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    statement_of_account: {
        type: String,
    },
    profile_picture: {
        type: String,
    },
    identification_card: {
        type: String,
    },
    other_documents: {
        type: [String], //array
    },
})

module.exports = mongoose.model("CustomerDocument", customerDocument);