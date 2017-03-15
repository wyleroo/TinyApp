// Set global declarations
const express = require("express");
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = process.env.PORT || 8080;

// Sample database - could be replaced later with input fxn
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// Entry field for URL to shorten
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Post request to handle new urls
app.post("/urls", (req, res) => {
  let randomShorty = generateRandomString();
  let newLongURL = req.body.longURL;
  urlDatabase[randomShorty] = newLongURL;
  console.log(newLongURL, randomShorty, urlDatabase);
  res.redirect(newLongURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

// Redirecting from shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL];
  console.log(redirectURL);
  res.redirect(redirectURL);
});

//Redirect and update database from Update button
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newHash;

  console.log(req.params.id,', newHash: ' ,req.body.newHash, urlDatabase);
  res.redirect("/urls");
});

// URLs index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// List of long and short URL based on short URL as id
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
    link: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Listening for web requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

