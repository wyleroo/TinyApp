// Import modules and assign to express
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const PORT = process.env.PORT || 8080;

// Sample database - could be replaced later with input fxn
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Sample user database
var users = {
  "wiley": {
    id: "wiley",
    email: "thewyatt@gmail.com",
    password: "coffee"
  },
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function emailChecker(emailIn) {
  for (entry in users) {
    var existing = false;
    if (users[entry].email == emailIn) {
      existing = true;
    };
  };
  return existing;
};

// Random string generator - to be set as randomShorty
function generateRandomString() {
  var output = '';
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 6; i++) {
    output += chars.charAt(Math.floor(Math.random()*chars.length));
  };
  return output;
};

//Login page
app.get("/login", (req, res) => {
  res.render("login");
});

//Login handler
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("You must fill out the things");
  } else if () {
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  };
});

// Registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// Registration handler
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (!req.body.email || !req.body.password || emailChecker(req.body.email)) {
    res.status(400).send("Nah that ain't cool");
  } else {
    let newUser = {id: randomID, email: req.body.email, password: req.body.password};
    users[randomID] = newUser;
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  };
});

// Entry field for URL to shorten
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// URLs index page
app.get("/urls", (req, res) => {
  // Pass specified user object
  let templateVars = { urls: urlDatabase, username: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

// List of long and short URL based on short URL as id
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, link: urlDatabase[req.params.id], username: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

//Post request to handle new urls
app.post("/urls", (req, res) => {
  let randomShorty = generateRandomString();
  urlDatabase[randomShorty] = req.body.longURL;
  res.redirect(req.body.longURL);
});

// Post request to delete cookies on logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

// Post request to delete database entries
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Redirecting from shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL];
  res.redirect(redirectURL);
});

//Redirect and update database from Update button
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newHash;
  res.redirect("/urls");
});

// Listening for web requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

