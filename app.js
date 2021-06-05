const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const LocaleStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const User = require("./models/user");
const Needy = require("./models/needy");
const districts_arr = require("./views/CoHelp/districts.js");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/CoHelpApp";
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("database online");
  })
  .catch((e) => {
    console.log("error", e);
  });
const secret = process.env.SECRET || "secret";
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
});
store.on("error", function (e) {
  console.log("store error", e);
});
const sessionConfig = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.use("/img", express.static("./img"));
app.use("/img/Facts", express.static("./img/Facts"));
app.use(express.static(path.join(__dirname, "/public")));

passport.use(new LocaleStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//dotnet is required
require("dotenv").config({ path: __dirname + "/.env" });
//backend//
var axios = require("axios");
app.use(express.urlencoded({ extended: true }));
const staticpath = path.join(__dirname);
app.use(express.static(staticpath));

// Declare the redirect route

var accessToken;
var TokenType;
app.use((req, res, next) => {
  res.locals.user = req.user || false;
  next();
});
app.get("/add", (req, res) => {
  if (req.user) {
    axios({
      // make a POST request
      method: "post",
      // to the Github authentication API, with the client ID, client secret
      // and request token
      url: `https://outpost.mapmyindia.com/api/security/oauth/token?grant_type=client_credentials&client_id=${process.env.clientID}&client_secret=${process.env.clientSecret}`,
      // Set the content type header, so that we get the response in JSOn
      headers: {
        accept: "application/json",
      },
    }).then((response) => {
      // Once we get the response, extract the access token from
      // the response body
      accessToken = response.data.access_token;
      TokenType = response.data.token_type;
      // redirect the user to the welcome page, along with the access token
    });
    res.render("CoHelp/add", {
      token_type: TokenType,
      access_token: accessToken,
      array: districts_arr,
    });
  } else {
    res.redirect("/");
  }
});
app.post("/add", function (req, res) {
  console.log(req.body);

  var need = new Needy({
    address: req.body.Address,
    number: req.body.Number,
    elocate: "https://maps.mapmyindia.com/@" + req.body.link,
    district: req.body.cityname,
    author: req.user._id,
  });
  need.save();
  res.redirect("/");
});

//backend//
app.get("/", (req, res) => {
  res.render(__dirname + "/views/CoHelp/welcome.ejs");
});
app.get("/register", (req, res) => {
  res.render(__dirname + "/views/CoHelp/register");
});
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username, password });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        throw err;
      }
    });
    res.redirect("/");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});
app.get("/get", (req, res) => {
  let find = false;
  res.render("CoHelp/get", { find });
});
app.post("/get", async (req, res) => {
  const places = await Needy.find(req.body).populate("author", "username");
  const find = true;
  res.render(__dirname + "/views/CoHelp/get", { places, find });
});
app.get("/login", (req, res) => {
  res.render(__dirname + "/views/CoHelp/login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/");
  }
);
app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});
app.listen(process.env.PORT, () => {
  console.log("Port online");
});
