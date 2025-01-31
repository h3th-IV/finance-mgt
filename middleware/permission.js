const Staff = require('../models/staff');
const Role = require('../models/role');
const jwt = require("jsonwebtoken");
const LoanApproval = require("../models/loanApproval");


const checkPermission = (...requiredPermissions) => {
    return async (req, res, next) => {
      try {
        const staffId = req.user.id;
        const staff = await Staff.findById(staffId).populate("role");
  
        if (!staff || !staff.role) {
          return res.status(403).json({ message: "Access denied: No role assigned." });
        }
  
        const { permissions } = staff.role;
        console.log('staff permissions: ', permissions)
  
        const permissionsToCheck = requiredPermissions.length > 0 ? requiredPermissions : [req.approvalAction.toUpperCase()];
        console.log(permissionsToCheck)
  
        //check if any of the required permissions exist in the staff's permissions
        const hasPermission = permissionsToCheck.some((permission) => permissions.includes(permission));
  
        if (!hasPermission) {
          return res.status(403).json({ message: "Access denied: Permission not granted." });
        }
  
        next();
      } catch (error) {
        console.error("Permission check error:", error);
        return res.status(500).json({ message: "Server error during permission check." });
      }
    };
  };



const verifyStaffToken = async (req, res, next) => {
    let token =
        req.body.token ||
        req.query.token ||
        req.header("x-auth-token") ||
        req.headers["authorization"];

    if (req.headers["authorization"]) {
        const bearer = token.split(" ");
        token = bearer[1];
    }

    if (!token) {
        return res.status(401).json({ msg: "No Permission: Token missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.isStaff) {
            return res.status(403).json({ msg: "Access denied: Not a staff token." });
        }

        const staff = await Staff.findById(decoded.id).populate("role");

        if (!staff) {
            return res.status(404).json({ msg: "Staff not found." });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role,
            isStaff: true,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token has expired. Please log in again." });
        }
        console.error("Error verifying staff token:", error);
        return res.status(400).json({ msg: "Invalid token." });
    }
};

const verifyAnyToken = async (req, res, next) => {
    let token =
        req.body.token ||
        req.query.token ||
        req.header("x-auth-token") ||
        req.headers["authorization"];

    if (req.headers["authorization"]) {
        const bearer = token.split(" ");
        token = bearer[1];
    }

    if (!token) {
        return res.status(401).json({ msg: "No Permission: Token missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "thugnificient@lethalinterjections.com");

        if (decoded.isStaff) {
            const staff = await Staff.findById(decoded.id).populate("role");

            if (!staff) {
                return res.status(404).json({ msg: "Staff not found." });
            }

            req.user = {
                id: decoded.id,
                role: decoded.role,
                isStaff: true,
            };
        } else {
            req.user = decoded;
        }

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token has expired. Please log in again." });
        }

        console.error("Error verifying token:", error);
        return res.status(400).json({ msg: "Invalid token." });
    }
};



const fetchApprovalAction = async (req, res, next) => {
  const { approvalId } = req.params;

  try {
    const approval = await LoanApproval.findById(approvalId);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval not found.",
        code: "NOT_FOUND",
      });
    }

    //attach the approval action to the request object
    req.approvalAction = approval.approvalAction;
    next();
  } catch (error) {
    console.error("Error fetching approval action:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};

module.exports = { checkPermission, verifyStaffToken, verifyAnyToken, fetchApprovalAction };
