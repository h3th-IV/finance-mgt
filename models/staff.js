const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const StaffSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
}, { timestamps: true });


StaffSchema.methods.generateStaffToken = function () {
    return jwt.sign(
        {
            userId: this.user,
            staffId: this._id,
            role: this.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

module.exports = mongoose.model("Staff", StaffSchema);
