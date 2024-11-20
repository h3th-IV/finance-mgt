const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const passport = require("passport");
const session = require("express-session");
const app = express();
const user = require("./routes/user");
const admin =require('./routes/admin');
const loanApp = require('./routes/loanApplication');
const cron = require("node-cron");
const userModel = require("./models/user");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(cookieParser());
app.set("view engine", "ejs");

const sever = http.createServer(app);

const db = require("./config/db");
db.connectDB();
// db.clearDatabase();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("capitalWise Backend is running");
});

app.get("/google-auth", function (req, res) {
  res.render("pages/auth");
});
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

var userProfile;
app.get("/success", (req, res) => res.send(userProfile));
app.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// route for sign out
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use("/api/v1/user", user);
app.use("/api/v1/admin", admin);
app.use("/api/v1/loanapp", loanApp);

const PORT = process.env.PORT || 9000;
sever.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`.blue);
});

// cron.schedule('*/1 * * * *', async () => {
//     console.log("there");
//     try {
//         const usersWithExpiredOTPs = await userModel.find({
//             otpExpired: false,
//             otpCreatedAt: { $lte: new Date(Date.now() - 5 * 60 * 1000) }
//         });

//         for (const user of usersWithExpiredOTPs) {
//             user.otp = "EXPIRED";
//             // user.otpCreatedAt = null;
//             user.otpExpired = true;
//             await user.save();
//         }
//         console.log(`Expired OTPs cleaned up at ${new Date().toISOString()}`);
//     } catch (error) {
//         console.error("Error during OTP cleanup:", error);
//     }
// });