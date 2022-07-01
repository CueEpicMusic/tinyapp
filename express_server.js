const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//View engine
app.set("view engine", "ejs");

//Helper function
const generateRandomString = () => {
  let r = Math.random().toString(36).substring(2, 8);
  return r;
};

//Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Get
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("login", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Post
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (foundUser) {
    return res.status(403).send("A user with that email already exists!");
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;

  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (!foundUser) {
    return res.status(403).send("No user with that email found!");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("Incorrect password!");
  }
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});
