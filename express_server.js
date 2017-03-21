// Import modules and assign to express
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession( {
  name: 'session',
  secret: 'mission'
}));

const PORT = process.env.PORT || 3000;

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
  }
};

// Function to verify email
function emailSearch(emailIn) {
  for (id in users) {
    if (users[id].email == emailIn){
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
  return null;
}

// Function to filter URLDatabase for permitted sites
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
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return output;
}

//Login page
app.get("/login", (req, res) => {
  if (req.session.cookie) {
    res.redirect("/urls");
  }
  res.render("login");
});

//Login handler
app.post("/login", (req, res) => {
  let typedWord = req.body.password;
  const user = users[loginReturn(req.body.email)];
  let userHash = user ? user.password : '';
  if (!req.body.email || !req.body.password) {
    res.status(403).send("Neg. Has to be valid email and password.");
  } else if (bcrypt.compareSync(typedWord, userHash) == false) {
    res.status(403).send("Password or email unauthorized.");
  } else if (bcrypt.compareSync(typedWord, userHash) == true) {
    req.session.user_id = loginReturn(req.body.email);
    req.session.user_email = req.body.email;
    res.redirect("/urls");
  }
});

// Registration page
app.get("/register", (req, res) => {
  let templateVars = {user_id: req.session.user_id,
    user_email: req.session.user_email
  };
  res.render("register", templateVars);
});

// Registration handler
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (!req.body.email || !req.body.password || emailSearch(req.body.email)) {
    res.status(400).send("Must register with an unused email. Need to fill out both fields.");
  } else {
    let hashWord = bcrypt.hashSync(req.body.password, 10);
    let newUser = {id: randomID, email: req.body.email, password: hashWord};
    users[randomID] = newUser;
    req.session.user_id = (loginReturn(req.body.email));
    req.session.user_email = req.body.email;
    res.redirect("/urls");
  }
});

// Entry field for URL to shorten
app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.session.user_id,
    user_email: req.session.user_email
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else if (!req.session.user_id) {
    res.status(401).send("You are not logged in.");
  }
});

// URLs index page
app.get("/urls", (req, res) => {
  let permitted = urlsForUser(req.session.user_id);
  let templateVars = {urls: permitted,
    user_id: req.session.user_id,
    user_email: req.session.user_email
  };
  if (req.session.user_id) {
      res.render("urls_index", templateVars);
  } else {
    res.redirect("login");
  }
});

// List of long and short URL based on short URL as id
app.get("/urls/:id", (req, res) => {
  let permitted = urlsForUser(req.session.user_id);
  let templateVars = { shortURL: req.params.id,
    link: urlDatabase[req.params.id],
    user_id: req.session.user_id,
    user_email: req.session.user_email
    };
  if (permitted[req.params.id]) {
    res.render("urls_show", templateVars);
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send("This site is not yet catalogued.");
  } else if (!req.session.user_id) {
    res.status(401).send("You are not logged in.");
  } else if (!permitted[req.params.id]) {
    res.status(403).send("You do not have access to this URL");
  }
});

//Post request to handle new urls
app.post("/urls", (req, res) => {
  let randomShorty = generateRandomString();
  urlDatabase[randomShorty] = {site: req.body.longURL,
    userPermission: req.session.user_id,
    user_email: req.session.user_email
  };
  res.redirect("/urls");
});

// Redirecting from shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL].site;
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(redirectURL);
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("That shortURL does not yet exist.");
  }
});

// Logout and delete cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Post request to delete database entries
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id){
    delete urlDatabase[req.params.id];
      res.redirect("/urls");
  } else {
    res.status(401).send("No, don't");
  }
});

//Redirect and update database from Update button
app.post("/urls/:id/update", (req, res) => {
  if (req.session.user_id == urlDatabase[req.params.id].userPermission) {
    urlDatabase[req.body.newHash] = urlDatabase[req.params.id];
    urlDatabase[req.body.newHash].userPermission = req.session.user_id;
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorized.");
  }
});

// Listening for web requests
app.listen(PORT, () => {
  console.log(`Example app is totally listening on port ${PORT}!`);
});

