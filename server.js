const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const passport = require("passport");
const session = require("express-session");
const app = express();

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

app.use(passport.initialize());
app.use(passport.session);

app.use(cors());
app.use(cookieParser());
app.set("view engine", "ejs");

const sever = http.createServer(app)

