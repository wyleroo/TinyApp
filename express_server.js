// Import modules and assign to express
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const PORT = process.env.PORT || 8080;

// Sample database - could be replaced later with input fxn
const urlDatabase = {
  "b2xVn2": {site: "http://www.lighthouselabs.ca", userPermission: "wiley"},
  "9sm5xK": {site: "http://www.google.com", userPermission: "wiley"}
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

// Function to verify email
function emailSearch(emailIn) {
  for (id in users) {
    if (users[id].email == emailIn){
      return true
    }
  }
  return false
}

// FUnction to verify password
function passwordSearch(passwordIn) {
  for (id in users) {
    if (users[id].password == passwordIn){
      return true;
    }
  }
  return false;
}

// Function to return user id based on email match
function loginReturn(loginEmail) {
  for (key in users) {
    if (users[key].email == loginEmail){
      return users[key].id;
    }
  }
  return false;
}

function urlsForUser(idRequest) {
  let urlUser = {};
  for (key in urlDatabase) {
    if (urlDatabase[key].userPermission == idRequest) {
      urlUser[key] = urlDatabase[key].site;
    }
  }
  return urlUser;
}

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
  let typedWord = req.body.password;
  let userHash = users[loginReturn(req.body.email)].password;
  console.log(userHash, typedWord)
  if (!req.body.email || !req.body.password) {
    res.status(403).send("Neg");
  } else if (bcrypt.compareSync(typedWord, userHash) == false) {
    res.status(403).send("password be rong");
  } else if (bcrypt.compareSync(typedWord, userHash) == true) {
    res.cookie('user_id', loginReturn(req.body.email));
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
  if (!req.body.email || !req.body.password || emailSearch(req.body.email)) {
    res.status(400).send("Nah that ain't cool");
  } else {
    let hashWord = bcrypt.hashSync(req.body.password, 10);
    let newUser = {id: randomID, email: req.body.email, password: hashWord};
    users[randomID] = newUser;
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  };
});

// Entry field for URL to shorten
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id){
    res.render("urls_new");
  } else {
    res.redirect("login");
  }
});

// URLs index page
app.get("/urls", (req, res) => {
  let permitted = urlsForUser(req.cookies.user_id);
  console.log('permitted', permitted);
  let templateVars = {urls: permitted, user_id: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

// List of long and short URL based on short URL as id
app.get("/urls/:id", (req, res) => {
  console.log('rpi', req.params);
  let templateVars = { shortURL: req.params.id, link: urlDatabase[req.params.id], user_id: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

// Redirecting from shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL].site;
  res.redirect(redirectURL);
});

//Post request to handle new urls
app.post("/urls", (req, res) => {
  let randomShorty = generateRandomString();
  urlDatabase[randomShorty] = {site: req.body.longURL, userPermission: req.cookies.user_id};
  console.log(urlDatabase);
  res.redirect(req.body.longURL);
});

// Logout and delete cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Post request to delete database entries
app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies.user_id){
      delete urlDatabase[req.params.id];
        res.redirect("/urls");
    } else {
      res.status(401).send("No, don't");
    }
});

//Redirect and update database from Update button
app.post("/urls/:id/update", (req, res) => {
  console.log('urlDatabase', urlDatabase);
  if (req.cookies.user_id == urlDatabase[req.params.id].userPermission) {
    urlDatabase[req.body.newHash] = urlDatabase[req.params.id];
    urlDatabase[req.body.newHash].userPermission = req.cookies.user_id;
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(401).send("Please no");
  }
});

// Listening for web requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

