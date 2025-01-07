const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

exports.tokenProvider = (req, res) => {
    jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
         res.json({
            token: token,
            msg: "Token generated successfully"
          })
        }
      )
}

exports.verifyToken = (req, res, next) => {
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
        return res.status(401).json({ msg: "No Permission" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "thugnificient@lethalinterjections.com");
        req.user = decoded;
        next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Token has expired. Please log in again." });
      }
      return res.status(400).json({ msg: "Invalid token." });
    }
};


exports.Business = (req, res, next) => {
  if (req.user.accountType !== "business") {
    return res.status(403).send({ message: "Access denied" });
  }
  next();
};


