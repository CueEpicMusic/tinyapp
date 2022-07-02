const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require("./helpers");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
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
app.use(
  cookieSession({
    name: "session",
    keys: ["SuperSecretKeys"],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

//View engine
app.set("view engine", "ejs");

//Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Get
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
  if (users[userId]) {
    let finalObj = urlsForUser(userId, urlDatabase);
    const templateVars = {
      user: users[userId],
      urls: finalObj,
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (
    users[req.session.user_id].id === urlDatabase[req.params.shortURL].userID
  ) {
    const templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send("No longURL associated with that shortURL!");
  } else {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
});

//Post
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  if (
    users[req.session.user_id].id === urlDatabase[req.params.shortURL].userID
  ) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have permission to update!");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (
    users[req.session.user_id].id === urlDatabase[req.params.shortURL].userID
  ) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have permission to delete!");
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const foundUser = getUserByEmail(email, users);

  if (foundUser) {
    return res.status(403).send("A user with that email already exists!");
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password: hashedPassword,
  };
  users[id] = newUser;

  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res.status(403).send("No user with that email found!");
  }

  if (!bcrypt.compareSync(foundUser.password, password)) {
    return res.status(403).send("Incorrect password!");
  }
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
