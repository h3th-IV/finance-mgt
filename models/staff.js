const mongoose = require("mongoose");

const Staff = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    date_of_birth: {
        type: Date,
    },
    address: {
        type: String,
    },
    status: {
        type: String,
    },
});

module.exports = mongoose.model("Staff", Staff);