const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    permissions: {
        type: [String],
        required: true,
        validate: {
            validator: function (val) {
                return Array.isArray(val) && val.length > 0; //at least one permission
            },
            message: 'Permissions array must contain at least one permission.',
        },
    },
}, {
    timestamps: true,
});

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
