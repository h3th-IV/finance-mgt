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
  if (!token) return res.status(401).json({ msg: "No Permission" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.status(200).json({ msg: "Token valid", res});
  } catch (e) {
    res.status(400).json({ msg: "The token used has expired", e});
  }
}