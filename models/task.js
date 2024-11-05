const mongoose = require("mongoose");
const Staff = require("./staff");

const Task = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true,
    },
    task_type: {
        type: String,
    },
    status: {
        type: String,
        enum: ["", ""],
        default: "",
    },
});

module.exports = mongoose.model("Task", Task);