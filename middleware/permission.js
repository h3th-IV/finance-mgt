const Staff = require('../models/staff');
const Role = require('../models/role');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const staffId = req.user.staffId;
            const staff = await Staff.findById(staffId).populate("role");
            
            if (!staff || !staff.role) {
                return res.status(403).json({ message: "Access denied: No role assigned." });
            }

            const { permissions } = staff.role;

            if (!permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: "Access denied: Permission not granted." });
            }

            next();
        } catch (error) {
            console.error("Permission check error:", error);
            return res.status(500).json({ message: "Server error during permission check." });
        }
    };
};

module.exports = { checkPermission };
