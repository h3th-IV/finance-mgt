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
const guarantor = require("./routes/guarantor");
const admin =require('./routes/admin');
const loanApp = require('./routes/loanApplication');
const cron = require("node-cron");
const userModel = require("./models/user");
const business = require("./routes/business");
const approval = require("./routes/approval");
const report = require("./routes/report");

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
const LoanApplicationController = require("./controllers/loanApplicationController");
const AdminController = require("./controllers/adminController");
const { generateOfferLetter } = require("./services/offerLetterService");
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
app.use("/api/v1/guarantor", guarantor);
app.use("/api/v1/admin", admin);
app.use("/api/v1/loanapp", loanApp);
app.post('/api/v1/loan-calculator', LoanApplicationController.loanCalculator);
app.use("/api/v1/business", business);
app.use("/api/v1/approval", approval);
app.use("/api/v1/report", report);
// app.post('/api/v1/sms', AdminController.sendSMS);
const PORT = process.env.PORT || 9000;
sever.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`.blue);
});


const offer_data = {
  name: "Thread Miller",
  address: "1, Clother Close, Nashville.",
  loan_amount: 100000,
  facility_type: "SMB Loan",
  duration: 2,
  purpose: "Business Enlargement",
  interest_rate: 4.5,
  processing_fee: 100,
  security_guarantors:{
    guarantor_1: "Wheel Miller",
    guarantor_2: "Wool Miller"
  },
  security_others: ["Vehicle Documents", "C of O"],
  repayment_plan: [
    { amount: 50416.67, date: "2025-04-07" },
    { amount: 50416.67, date: "2025-05-07" },
    { amount: 50416.67, date: "2025-05-07" },
    { amount: 50416.67, date: "2025-05-07" },
    { amount: 50416.67, date: "2025-05-07" },
    { amount: 50416.67, date: "2025-05-07" },
    { amount: 50416.67, date: "2025-05-07" }
  ],
  loan_id: "CWLN-1024"
}
// const offer_letter = generateOfferLetter(offer_data);
// console.log("letter_url: ", offer_letter);